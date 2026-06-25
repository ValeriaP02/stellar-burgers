# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: constructor.pl.tsx >> Burger constructor >> Открытие/закрытие модального окна: крестик
- Location: src\tests\constructor.pl.tsx:86:7

# Error details

```
Error: page.goto: net::ERR_FAILED at http://127.0.0.1:4000/
Call log:
  - navigating to "http://127.0.0.1:4000/", waiting until "domcontentloaded"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import fs from 'node:fs';
  3   | import path from 'node:path';
  4   | 
  5   | const HAR_DIR = path.resolve(__dirname, './hars');
  6   | const INGREDIENTS_HAR = path.join(HAR_DIR, 'ingredients.har');
  7   | const ORDERS_HAR = path.join(HAR_DIR, 'orders.har');
  8   | 
  9   | const SELECT = {
  10  |   ingredientCard: '[data-testid="ingredient-card"]',
  11  |   ingredientName: '[data-testid="ingredient-name"]',
  12  |   ingredientModal: '[data-testid="ingredient-modal"]',
  13  |   ingredientModalClose: '[data-testid="modal-close"]',
  14  |   ingredientModalOverlay: '[data-testid="ingredient-modal"]',
  15  |   ingredientAdd: '[data-testid="ingredient-add"]',
  16  | 
  17  |   constructorItem: '[data-testid="constructor-item"]',
  18  |   checkoutButton: '[data-testid="checkout-button"]',
  19  | 
  20  |   orderModal: '[data-testid="order-modal"]',
  21  |   orderNumber: '[data-testid="order-number"]',
  22  | 
  23  |   modalClose: '[data-testid="modal-close"]'
  24  | };
  25  | 
  26  | function readOrderNumberFromHar(ordersHarPath: string) {
  27  |   const raw = fs.readFileSync(ordersHarPath, 'utf-8');
  28  |   const json = JSON.parse(raw);
  29  | 
  30  |   const entries = json?.log?.entries ?? [];
  31  |   for (const entry of entries) {
  32  |     const text = entry?.response?.content?.text;
  33  |     if (!text) continue;
  34  | 
  35  |     try {
  36  |       const parsed = JSON.parse(text);
  37  |       if (parsed?.orders?.[0]?.number != null)
  38  |         return Number(parsed.orders[0].number);
  39  |       if (parsed?.order?.number != null) return Number(parsed.order.number);
  40  |       if (parsed?.number != null) return Number(parsed.number);
  41  |     } catch {}
  42  |   }
  43  |   throw new Error(`Не удалось извлечь number заказа из ${ordersHarPath}`);
  44  | }
  45  | 
  46  | test.describe('Burger constructor', () => {
  47  |   const accessTokenFake = 'fake_access_token';
  48  |   const refreshTokenFake = 'fake_refresh_token';
  49  | 
  50  |   const expectedOrderNumber = readOrderNumberFromHar(ORDERS_HAR);
  51  | 
  52  |   test.beforeEach(async ({ page, context }) => {
  53  |     await page.addInitScript(
  54  |       ({ accessToken, refreshToken }) => {
  55  |         window.localStorage.setItem('refreshToken', refreshToken);
  56  |         window.localStorage.setItem('accessToken', accessToken);
  57  |       },
  58  |       { accessToken: accessTokenFake, refreshToken: refreshTokenFake }
  59  |     );
  60  | 
  61  |     await context.addCookies([
  62  |       {
  63  |         name: 'accessToken',
  64  |         value: accessTokenFake,
  65  |         domain: 'localhost',
  66  |         path: '/'
  67  |       }
  68  |     ]);
  69  | 
  70  |     await page.routeFromHAR(INGREDIENTS_HAR);
  71  |     await page.routeFromHAR(ORDERS_HAR);
  72  |   });
  73  | 
  74  |   test('Добавление ингредиента в конструктор', async ({ page }) => {
  75  |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  76  | 
  77  |     const cards = page.locator(SELECT.ingredientCard);
  78  |     await expect(cards.first()).toBeVisible();
  79  | 
  80  |     const before = await page.locator(SELECT.constructorItem).count();
  81  | 
  82  |     await cards.first().locator(SELECT.ingredientAdd).click();
  83  |     await expect(page.locator(SELECT.constructorItem)).toHaveCount(before + 1);
  84  |   });
  85  | 
  86  |   test('Открытие/закрытие модального окна: крестик', async ({ page }) => {
> 87  |     await page.goto('/', { waitUntil: 'domcontentloaded' });
      |                ^ Error: page.goto: net::ERR_FAILED at http://127.0.0.1:4000/
  88  | 
  89  |     const cards = page.locator(SELECT.ingredientCard);
  90  |     await expect(cards.first()).toBeVisible();
  91  | 
  92  |     await cards.first().click();
  93  |     await expect(page.locator(SELECT.ingredientModal)).toBeVisible();
  94  | 
  95  |     await page.locator(SELECT.ingredientModalClose).click();
  96  |     await expect(page.locator(SELECT.ingredientModal)).toBeHidden();
  97  |   });
  98  | 
  99  |   test('Закрытие модального окна ингредиента: оверлей (клик по фону)', async ({
  100 |     page
  101 |   }) => {
  102 |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  103 | 
  104 |     const cards = page.locator(SELECT.ingredientCard);
  105 |     const firstCard = cards.first();
  106 |     await expect(firstCard).toBeVisible();
  107 | 
  108 |     await firstCard.click();
  109 |     const modal = page.locator(SELECT.ingredientModal);
  110 |     await expect(modal).toBeVisible();
  111 | 
  112 |     await page.locator(SELECT.ingredientModalOverlay).click();
  113 | 
  114 |     await expect(modal).toBeHidden();
  115 |   });
  116 | 
  117 |   test('Модальное окно показывает данные именно выбранного ингредиента', async ({
  118 |     page
  119 |   }) => {
  120 |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  121 | 
  122 |     const cards = page.locator(SELECT.ingredientCard);
  123 |     await expect(cards.first()).toBeVisible();
  124 | 
  125 |     const targetCard = cards.nth(0);
  126 |     const expectedName = await targetCard
  127 |       .locator(SELECT.ingredientName)
  128 |       .first()
  129 |       .innerText();
  130 | 
  131 |     await targetCard.click();
  132 | 
  133 |     const modal = page.locator(SELECT.ingredientModal);
  134 |     await expect(modal).toBeVisible();
  135 | 
  136 |     const modalName = modal.locator(SELECT.ingredientName).first();
  137 |     await expect(modalName).toHaveText(expectedName);
  138 |   });
  139 | 
  140 |   test('Создание заказа: верный номер и очистка конструктора + закрытие модалки', async ({
  141 |     page
  142 |   }) => {
  143 |     await page.goto('/', { waitUntil: 'domcontentloaded' });
  144 | 
  145 |     const cards = page.locator(SELECT.ingredientCard);
  146 |     await expect(cards.first()).toBeVisible();
  147 | 
  148 |     await cards.first().locator(SELECT.ingredientAdd).click();
  149 |     await expect(page.locator(SELECT.constructorItem)).toHaveCount(1);
  150 | 
  151 |     await page.locator(SELECT.checkoutButton).click();
  152 | 
  153 |     const orderModal = page.locator(SELECT.orderModal);
  154 |     await expect(orderModal).toBeVisible();
  155 | 
  156 |     await expect(page.locator(SELECT.orderNumber)).toHaveText(
  157 |       String(expectedOrderNumber)
  158 |     );
  159 | 
  160 |     await expect(page.locator(SELECT.constructorItem)).toHaveCount(0);
  161 | 
  162 |     await page.locator(SELECT.modalClose).click();
  163 |     await expect(orderModal).toBeHidden();
  164 |   });
  165 | });
  166 | 
```