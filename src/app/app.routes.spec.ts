import { routes } from './app.routes';

describe('routes', () => {
  it('declares a direct all-question review route', () => {
    const route = routes.find((candidate) => candidate.path === 'review/all');

    expect(route?.data).toEqual({ reviewMode: 'allQuestions' });
  });
});
