import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const HAR_DIR = path.join(__dirname, 'hars');
const INGREDIENTS_HAR = path.join(HAR_DIR, 'ingredients.har');
const ORDERS_HAR = path.join(HAR_DIR, 'orders.har');

export const SELECT = {
  burgerConstructor: '[data-cy="burger-constructor"]',
  constructorBunTop: '[data-cy="constructor-bun-top"]',
  constructorBunBottom: '[data-cy="constructor-bun-bottom"]',
  constructorFilling: '[data-cy="constructor-filling"]',
  constructorItem: '[data-cy="constructor-item"]',

  orderButton: '[data-cy="order-button"]',

  orderModal: '[data-cy="order-modal"]',
  orderNumber: '[data-cy="order-number"]',
  orderModalLoading: '[data-cy="order-modal-loading"]',
  orderModalClose: '[data-cy="order-modal-close"]',

  ingredientCard: '[data-cy="ingredient-card"]',
  ingredientName: '[data-cy="ingredient-name"]',
  ingredientAdd: '[data-cy="ingredient-add"]',
  bunLabel: '[data-cy="bun-label"]',
  fillingLabel: '[data-cy="filling-label"]',

  ingredientModal: '[data-cy="ingredient-modal"]',
  ingredientModalOverlay: '[data-cy="ingredient-modal-overlay"]',
  ingredientModalClose: '[data-cy="ingredient-modal-close"]'
};

function readOrderNumberFromHar(harFilePath: string): number {
  const harContent = fs.readFileSync(harFilePath, 'utf-8');
  const entries = JSON.parse(harContent).log?.entries;

  const orderEntry = entries.find(
    (entry: any) =>
      entry.request.method === 'POST' &&
      /\/api\/orders$/.test(entry.request.url)
  );

  const responseBody = orderEntry.response?.content?.text;
  return JSON.parse(responseBody).order.number;
}

function getIngredientsFromHar(harFilePath: string): any[] {
  const harContent = fs.readFileSync(harFilePath, 'utf-8');
  const entries = JSON.parse(harContent).log?.entries;

  const ingredientsEntry = entries.find(
    (entry: any) =>
      entry.request.method === 'GET' &&
      /\/api\/ingredients$/.test(entry.request.url)
  );

  const responseBody = ingredientsEntry.response?.content?.text;
  const parsed = JSON.parse(responseBody);

  return Array.isArray(parsed.data) ? parsed.data : parsed;
}

test.describe('Конструктор бургера', () => {
  const accessTokenFake = 'fake_access_token';
  const refreshTokenFake = 'fake_refresh_token';

  const expectedOrderNumber = readOrderNumberFromHar(ORDERS_HAR);
  const ingredientsData = getIngredientsFromHar(INGREDIENTS_HAR);

  test.beforeEach(async ({ page, context }) => {
    await page.route('**/api/ingredients**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, data: ingredientsData }),
        contentType: 'application/json'
      });
    });

    await page.route('**/api/orders**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          order: { number: expectedOrderNumber }
        }),
        contentType: 'application/json'
      });
    });

    await page.route('**/api/auth/user**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          user: { email: 'test@test.com', name: 'TestUser' }
        }),
        contentType: 'application/json'
      });
    });

    await context.addCookies([
      {
        name: 'accessToken',
        value: accessTokenFake,
        domain: 'localhost',
        path: '/'
      }
    ]);

    await page.addInitScript(
      ({ accessToken, refreshToken }) => {
        window.localStorage.setItem('accessToken', accessToken);
        window.localStorage.setItem('refreshToken', refreshToken);
      },
      { accessToken: accessTokenFake, refreshToken: refreshTokenFake }
    );

    await page.goto('http://localhost:4000', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForSelector('[data-cy="ingredient-card"]', {
      state: 'visible',
      timeout: 10000
    });

    console.log('Страница загружена, ингредиенты отображаются');
  });

  test('Добавление ингредиента в конструктор', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const nonBunIngredient = page
      .locator('[data-cy-type]:not([data-cy-type="bun"])')
      .first();

    const addBtn = nonBunIngredient.locator(SELECT.ingredientAdd);
    await expect(addBtn).toBeVisible({ timeout: 5000 });

    console.log('Нажимаем кнопку "Добавить"');
    await addBtn.click();

    const constructorItems = page.locator(SELECT.constructorItem);
    await expect(constructorItems.first()).toBeVisible({ timeout: 5000 });

    console.log('Ингредиент успешно добавлен в конструктор');
  });

  test('Открытие/закрытие модального окна: крестик', async ({ page }) => {
    const cards = page.locator(SELECT.ingredientCard);

    console.log('Кликаем по карточке ингредиента...');
    await cards.first().click();

    const modal = page.locator(SELECT.ingredientModal);
    await expect(modal.first()).toBeVisible({ timeout: 10000 });
    console.log('Модальное окно открыто');

    const closeBtn = page.locator(SELECT.ingredientModalClose);
    await expect(closeBtn).toBeVisible({ timeout: 5000 });

    console.log('Нажимаем кнопку закрытия...');
    await closeBtn.click();

    await expect(modal).toBeHidden({ timeout: 10000 });
    console.log('Модальное окно успешно закрыто через крестик');
  });

  test('Закрытие модального окна ингредиента: оверлей', async ({ page }) => {
    const cards = page.locator(SELECT.ingredientCard);
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    console.log('Кликаем по карточке ингредиента...');
    await cards.first().click();

    const modal = page.locator(SELECT.ingredientModal);
    await expect(modal.first()).toBeVisible({ timeout: 10000 });
    console.log('Модальное окно открыто');

    const overlay = page
      .locator('[class*="overlay"], [class*="Overlay"]')
      .first();

    const overlayExists = await overlay.count();

    if (overlayExists > 0) {
      console.log('Кликаем по оверлею...');
      await overlay.click();
    } else {
      console.log('Оверлей не найден. Кликаем вне модального окна...');
      await page.mouse.click(10, 10);
    }

    await expect(modal).toBeHidden({ timeout: 10000 });
    console.log('Модальное окно успешно закрыто кликом по оверлею');
  });

  test('Модальное окно показывает данные именно выбранного ингредиента', async ({
    page
  }) => {
    const cards = page.locator(SELECT.ingredientCard);
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    const targetCard = cards.first();
    const expectedName = await targetCard
      .locator(SELECT.ingredientName)
      .first()
      .innerText();

    console.log('Кликаем по карточке ингредиента...');
    await targetCard.click();

    const modal = page.locator(SELECT.ingredientModal);
    await expect(modal.first()).toBeVisible({ timeout: 10000 });
    console.log('Модальное окно открыто');

    const modalNameLocator = modal
      .first()
      .locator(SELECT.ingredientName)
      .first();

    const nameExists = await modalNameLocator.count();

    if (nameExists > 0) {
      const modalName = await modalNameLocator.innerText();
      expect(modalName).toBe(expectedName);
    } else {
      const modalText = await modal.first().innerText();
      expect(modalText).toContain(expectedName);
    }

    console.log('Модальное окно содержит корректные данные ингредиента');
  });

  test('Создание заказа: верный номер и очистка конструктора', async ({
    page
  }) => {
    const cards = page.locator(SELECT.ingredientCard);
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    console.log('Добавление булок...');
    const bunCards = cards.filter({ has: page.locator(SELECT.bunLabel) });

    if ((await bunCards.count()) > 0) {
      const bunAddBtn = bunCards.first().locator(SELECT.ingredientAdd).first();
      if ((await bunAddBtn.count()) > 0) {
        await bunAddBtn.click();
        console.log('Булка добавлена в конструктор');
        await page.waitForTimeout(500);
      }
    }

    const bunTop = page.locator(SELECT.constructorBunTop).first();
    const bunBottom = page.locator(SELECT.constructorBunBottom).first();

    if ((await bunTop.count()) > 0) {
      await expect(bunTop).toBeVisible({ timeout: 5000 });
      console.log('Булка отображается в конструкторе');
    }

    console.log('Добавление начинки...');
    const fillingCards = cards.filter({
      has: page.locator(SELECT.fillingLabel)
    });

    if ((await fillingCards.count()) > 0) {
      const fillingAddBtn = fillingCards
        .first()
        .locator(SELECT.ingredientAdd)
        .first();

      if ((await fillingAddBtn.count()) > 0) {
        await fillingAddBtn.click();
        console.log('Начинка добавлена в конструктор');
      }
    }

    await page.waitForTimeout(1000);

    const constructorItems = page.locator(SELECT.constructorItem);
    const itemsCount = await constructorItems.count();

    if (itemsCount === 0) {
      throw new Error('Конструктор пуст перед созданием заказа');
    }

    console.log('Оформление заказа...');
    const orderBtn = page.locator(SELECT.orderButton).first();
    await expect(orderBtn).toBeVisible({ timeout: 5000 });
    await orderBtn.click();

    const orderModal = page.locator(SELECT.orderModal);
    await expect(orderModal.first()).toBeVisible({ timeout: 20000 });
    console.log('Модальное окно заказа открыто');

    const orderNumberElement = page.locator(SELECT.orderNumber).first();
    if ((await orderNumberElement.count()) > 0) {
      const orderText = await orderNumberElement.innerText();
      const actualNumber = orderText.replace(/\D/g, '');
      console.log(`Номер заказа: ${actualNumber}`);
      expect(actualNumber).toBe(String(expectedOrderNumber));
    } else {
      throw new Error('Номер заказа не отображается в модальном окне');
    }

    const itemsAfterOrder = await constructorItems.count();
    expect(itemsAfterOrder).toBe(0);
    console.log('Конструктор успешно очищен после создания заказа');

    const closeBtn = page.locator(SELECT.orderModalClose).first();
    if ((await closeBtn.count()) > 0) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }

    await expect(orderModal).toBeHidden({ timeout: 5000 });
    console.log('Тест создания заказа завершён успешно');
  });
});
