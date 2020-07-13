import Budget from '../Models/BudgetModel';

/**
 * BUDGET
 * id: identifier
 * value: integer
 * currency: 'PLN' from array ['PLN', 'EUR', ...]
 * history: [
 *            {id: 1, title: 'Shoes', value: '-100', date: new Date.now()},
 *            {id: 2, title: 'Additional funds', value: '250', date: new Date.now()}
 *          ];
 */
const BUDGET = [
  // currency 1
  new Budget(1, 2500, 'PLN', [
    {id: 1, title: 'Shoes', value: '-100', date: Date.now()},
    {id: 2, title: 'Additional funds', value: '250', date: Date.now()},
    {id: 3, title: 'Mistake', value: '0', date: Date.now()},
    {id: 4, title: 'Additional funds', value: '500', date: Date.now()},
    {id: 5, title: 'Bag', value: '-600', date: Date.now()},
  ]),
  // currency 2
  new Budget(2, 500, 'EUR', []),
];

export default BUDGET;