import ingredientsReducer, { fetchIngredients } from '../ingredientsSlice';

describe('ingredients reducer', () => {
  it('returns initial state for unknown action (state undefined)', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual({
      items: [],
      loading: false,
      error: null
    });
  });

  it('handles fetchIngredients.pending', () => {
    const prevState = {
      items: [
        {
          _id: '1',
          name: 'x',
          type: 'bun',
          proteins: 1,
          fat: 1,
          carbohydrates: 1,
          calories: 1,
          price: 1,
          image: 'i',
          image_large: 'i_large',
          image_mobile: 'i_mobile'
        }
      ],
      loading: false,
      error: 'err'
    };

    const state = ingredientsReducer(
      prevState as any,
      fetchIngredients.pending('reqId')
    );
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('handles fetchIngredients.fulfilled', () => {
    const payload = [
      {
        _id: '1',
        name: 'Bun',
        type: 'bun',
        proteins: 1,
        fat: 1,
        carbohydrates: 1,
        calories: 1,
        price: 10,
        image: 'bun.jpg',
        image_large: 'bun_large.jpg',
        image_mobile: 'bun_mobile.jpg'
      },
      {
        _id: '2',
        name: 'Sauce',
        type: 'sauce',
        proteins: 1,
        fat: 1,
        carbohydrates: 1,
        calories: 1,
        price: 5,
        image: 'sauce.jpg',
        image_large: 'sauce_large.jpg',
        image_mobile: 'sauce_mobile.jpg'
      }
    ];

    const state = ingredientsReducer(
      undefined,
      fetchIngredients.fulfilled(payload, 'reqId')
    );

    expect(state.loading).toBe(false);
    expect(state.items).toEqual(payload);
    expect(state.error).toBeNull();
  });

  it('handles fetchIngredients.rejected', () => {
    const state = ingredientsReducer(undefined, {
      type: fetchIngredients.rejected.type,
      payload: 'Ошибка загрузки'
    } as any);

    expect(state.loading).toBe(false);
    expect(state.error).toBe('Ошибка загрузки');
  });

  it('handles fetchIngredients.rejected without payload uses default message', () => {
    const state = ingredientsReducer(undefined, {
      type: fetchIngredients.rejected.type,
      payload: undefined
    } as any);

    expect(state.loading).toBe(false);
    expect(state.error).toBe('Ошибка загрузки ингредиентов');
  });
});
