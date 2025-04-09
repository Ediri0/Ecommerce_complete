import { left, right } from './either';

describe('Either Utility', () => {
  it('should create a left value', () => {
    const result = left('Error');
    expect(result.isLeft()).toBe(true);
    expect(result.isRight()).toBe(false);
    expect(result.value).toBe('Error');
  });

  it('should create a right value', () => {
    const result = right('Success');
    expect(result.isRight()).toBe(true);
    expect(result.isLeft()).toBe(false);
    expect(result.value).toBe('Success');
  });
});

test('hello world!', () => {
  expect(left('error')).toBeDefined();
  expect(right('success')).toBeDefined();
});