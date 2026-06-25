import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const HAR_DIR = path.resolve(__dirname, './hars');
const INGREDIENTS_HAR = path.join(HAR_DIR, 'ingredients.har');
const ORDERS_HAR = path.join(HAR_DIR, 'orders.har');

const SELECT = {
  ingredientCard: '[data-testid="ingredient-card"]',
  ingredientName: '[data-testid="ingredient-name"]',
  ingredientModal: '[data-testid="ingredient-modal"]',
  ingredientModalClose: '[data-testid="modal-close"]',
  ingredientModalOverlay: '[data-testid="ingredient-modal"]',
  ingredientAdd: '[data-testid="ingredient-add"]',

  constructorItem: '[data-testid="constructor-item"]',
  checkoutButton: '[data-testid="checkout-button"]',

  orderModal: '[data-testid="order-modal"]',
  orderNumber: '[data-testid="order-number"]',

  modalClose: '[data-testid="modal-close"]'
};

function readOrderNumberFromHar(ordersHarPath: string) {
  const raw = fs.readFileSync(ordersHarPath, 'utf-8');
  const json = JSON.parse(raw);

  const entries = json?.log?.entries ?? [];
  for (const entry of entries) {
    const text = entry?.response?.content?.text;
    if (!text) continue;

    try {
      const parsed = JSON.parse(text);
      if (parsed?.orders?.[0]?.number != null)
        return Number(parsed.orders[0].number);
      if (parsed?.order?.number != null) return Number(parsed.order.number);
      if (parsed?.number != null) return Number(parsed.number);
    } catch {}
  }
  throw new Error(`Не удалось извлечь number заказа из ${ordersHarPath}`);
}

test.describe('Burger constructor', () => {
  const accessTokenFake = 'fake_access_token';
  const refreshTokenFake = 'fake_refresh_token';

  const expectedOrderNumber = readOrderNumberFromHar(ORDERS_HAR);

  test.beforeEach(async ({ page, context }) => {
    await page.addInitScript(
      ({ accessToken, refreshToken }) => {
        window.localStorage.setItem('refreshToken', refreshToken);
        window.localStorage.setItem('accessToken', accessToken);
      },
      { accessToken: accessTokenFake, refreshToken: refreshTokenFake }
    );

    await context.addCookies([
      {
        name: 'accessToken',
        value: accessTokenFake,
        domain: 'localhost',
        path: '/'
      }
    ]);

    await page.routeFromHAR(INGREDIENTS_HAR);
    await page.routeFromHAR(ORDERS_HAR);
  });

  test('Добавление ингредиента в конструктор', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const cards = page.locator(SELECT.ingredientCard);
    await expect(cards.first()).toBeVisible();

    const before = await page.locator(SELECT.constructorItem).count();

    await cards.first().locator(SELECT.ingredientAdd).click();
    await expect(page.locator(SELECT.constructorItem)).toHaveCount(before + 1);
  });

  test('Открытие/закрытие модального окна: крестик', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const cards = page.locator(SELECT.ingredientCard);
    await expect(cards.first()).toBeVisible();

    await cards.first().click();
    await expect(page.locator(SELECT.ingredientModal)).toBeVisible();

    await page.locator(SELECT.ingredientModalClose).click();
    await expect(page.locator(SELECT.ingredientModal)).toBeHidden();
  });

  test('Закрытие модального окна ингредиента: оверлей (клик по фону)', async ({
    page
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const cards = page.locator(SELECT.ingredientCard);
    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();

    await firstCard.click();
    const modal = page.locator(SELECT.ingredientModal);
    await expect(modal).toBeVisible();

    await page.locator(SELECT.ingredientModalOverlay).click();

    await expect(modal).toBeHidden();
  });

  test('Модальное окно показывает данные именно выбранного ингредиента', async ({
    page
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const cards = page.locator(SELECT.ingredientCard);
    await expect(cards.first()).toBeVisible();

    const targetCard = cards.nth(0);
    const expectedName = await targetCard
      .locator(SELECT.ingredientName)
      .first()
      .innerText();

    await targetCard.click();

    const modal = page.locator(SELECT.ingredientModal);
    await expect(modal).toBeVisible();

    const modalName = modal.locator(SELECT.ingredientName).first();
    await expect(modalName).toHaveText(expectedName);
  });

  test('Создание заказа: верный номер и очистка конструктора + закрытие модалки', async ({
    page
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const cards = page.locator(SELECT.ingredientCard);
    await expect(cards.first()).toBeVisible();

    await cards.first().locator(SELECT.ingredientAdd).click();
    await expect(page.locator(SELECT.constructorItem)).toHaveCount(1);

    await page.locator(SELECT.checkoutButton).click();

    const orderModal = page.locator(SELECT.orderModal);
    await expect(orderModal).toBeVisible();

    await expect(page.locator(SELECT.orderNumber)).toHaveText(
      String(expectedOrderNumber)
    );

    await expect(page.locator(SELECT.constructorItem)).toHaveCount(0);

    await page.locator(SELECT.modalClose).click();
    await expect(orderModal).toBeHidden();
  });
});
