import constructorReducer, {
  addIngredient,
  clearConstructor,
  clearOrderModalData,
  createOrder,
  moveIngredient,
  removeIngredient
} from '../constructorSlice';

const bun = {
  _id: 'b1',
  name: 'Bun',
  type: 'bun',
  proteins: 1,
  fat: 1,
  carbohydrates: 1,
  calories: 1,
  price: 10,
  image: 'bun.jpg',
  image_large: 'bun_large.jpg',
  image_mobile: 'bun_mobile.jpg',
  id: 'ctor-bun'
};

const filling = {
  _id: 'f1',
  name: 'Sauce',
  type: 'sauce',
  proteins: 1,
  fat: 1,
  carbohydrates: 1,
  calories: 1,
  price: 5,
  image: 'sauce.jpg',
  image_large: 'sauce_large.jpg',
  image_mobile: 'sauce_mobile.jpg',
  id: 'ctor-1'
};

describe('burgerConstructor reducer', () => {
  it('returns initial state for unknown action (state undefined)', () => {
    const state = constructorReducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual({
      bun: null,
      ingredients: [],
      orderRequest: false,
      error: null,
      orderModalData: null
    });
  });

  it('handles simple actions: addIngredient (bun)', () => {
    const state = constructorReducer(undefined, addIngredient(bun as any));
    expect(state.bun).toEqual(bun);
    expect(state.ingredients).toEqual([]);
  });

  it('handles simple actions: addIngredient (filling)', () => {
    const state = constructorReducer(undefined, addIngredient(filling as any));
    expect(state.bun).toBeNull();
    expect(state.ingredients).toEqual([filling]);
  });

  it('handles removeIngredient', () => {
    const state = constructorReducer(
      {
        bun: null,
        ingredients: [
          {
            id: 'a',
            _id: '1',
            type: 'sauce',
            name: 'A',
            proteins: 1,
            fat: 1,
            carbohydrates: 1,
            calories: 1,
            price: 1,
            image: 'i',
            image_large: 'il',
            image_mobile: 'im'
          },
          {
            id: 'b',
            _id: '2',
            type: 'sauce',
            name: 'B',
            proteins: 1,
            fat: 1,
            carbohydrates: 1,
            calories: 1,
            price: 1,
            image: 'i',
            image_large: 'il',
            image_mobile: 'im'
          }
        ],
        orderRequest: false,
        error: null,
        orderModalData: null
      } as any,
      removeIngredient('a')
    );

    expect(state.ingredients.map((i: any) => i.id)).toEqual(['b']);
  });

  it('handles moveIngredient', () => {
    const prev = {
      bun: null,
      ingredients: [
        {
          id: '0',
          _id: '1',
          type: 'sauce',
          name: 'A',
          proteins: 1,
          fat: 1,
          carbohydrates: 1,
          calories: 1,
          price: 1,
          image: 'i',
          image_large: 'il',
          image_mobile: 'im'
        },
        {
          id: '1',
          _id: '2',
          type: 'sauce',
          name: 'B',
          proteins: 1,
          fat: 1,
          carbohydrates: 1,
          calories: 1,
          price: 1,
          image: 'i',
          image_large: 'il',
          image_mobile: 'im'
        },
        {
          id: '2',
          _id: '3',
          type: 'sauce',
          name: 'C',
          proteins: 1,
          fat: 1,
          carbohydrates: 1,
          calories: 1,
          price: 1,
          image: 'i',
          image_large: 'il',
          image_mobile: 'im'
        }
      ],
      orderRequest: false,
      error: null,
      orderModalData: null
    } as any;

    const state = constructorReducer(
      prev,
      moveIngredient({ fromIndex: 0, toIndex: 2 })
    );
    expect(state.ingredients.map((i: any) => i.id)).toEqual(['1', '2', '0']);
  });

  it('handles clearConstructor', () => {
    const prev = {
      bun: {
        id: 'bun',
        _id: 'x',
        type: 'bun',
        name: 'Bun',
        proteins: 1,
        fat: 1,
        carbohydrates: 1,
        calories: 1,
        price: 1,
        image: 'i',
        image_large: 'il',
        image_mobile: 'im'
      },
      ingredients: [
        {
          id: '1',
          _id: 'y',
          type: 'sauce',
          name: 'S',
          proteins: 1,
          fat: 1,
          carbohydrates: 1,
          calories: 1,
          price: 1,
          image: 'i',
          image_large: 'il',
          image_mobile: 'im'
        }
      ],
      orderRequest: true,
      error: 'some error',
      orderModalData: { order: { number: 5, _id: 'o' }, name: 'test' } as any
    } as any;

    const state = constructorReducer(prev, clearConstructor());

    expect(state).toEqual({
      bun: null,
      ingredients: [],
      orderRequest: false,
      error: null,
      orderModalData: prev.orderModalData
    });
    expect(state.orderModalData).toBe(prev.orderModalData);
  });

  it('handles clearOrderModalData', () => {
    const prev = {
      bun: null,
      ingredients: [],
      orderRequest: true,
      error: 'some error',
      orderModalData: { order: { number: 7 } } as any
    } as any;

    const state = constructorReducer(prev, clearOrderModalData());
    expect(state.orderModalData).toBeNull();
    expect(state.orderRequest).toBe(false);
    expect(state.error).toBeNull();
  });

  it('handles createOrder.pending', () => {
    const prev = {
      bun: null,
      ingredients: [],
      orderRequest: false,
      error: 'err',
      orderModalData: { order: { number: 1 } } as any
    } as any;

    const state = constructorReducer(
      prev,
      createOrder.pending('reqId', ['id-1'])
    );

    expect(state.orderRequest).toBe(true);
    expect(state.orderModalData).toBeNull();
  });

  it('handles createOrder.fulfilled', () => {
    const payload = { order: { number: 123 } } as any;

    const state = constructorReducer(
      undefined,
      createOrder.fulfilled(payload, 'reqId', ['id-1'])
    );

    expect(state.orderRequest).toBe(false);
    expect(state.orderModalData).toEqual(payload);
  });

  it('handles createOrder.rejected', () => {
    const state = constructorReducer(undefined, {
      type: createOrder.rejected.type,
      payload: 'Ошибка при создании заказа'
    } as any);

    expect(state.orderRequest).toBe(false);
    expect(state.error).toBe('Ошибка при создании заказа');
  });

  it('handles createOrder.rejected without payload uses default message', () => {
    const state = constructorReducer(undefined, {
      type: createOrder.rejected.type,
      payload: undefined
    } as any);

    expect(state.orderRequest).toBe(false);
    expect(state.error).toBe('Ошибка при создании заказа');
  });
});
