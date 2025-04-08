export type Either<L, R> = Left<L, R> | Right<L, R>;

export class Left<L, R> {
  constructor(public value: L) {}
  isLeft(): this is Left<L, R> {
    return true;
  }
  isRight(): this is Right<L, R> {
    return false;
  }
}

export class Right<L, R> {
  constructor(public value: R) {}
  isLeft(): this is Left<L, R> {
    return false;
  }
  isRight(): this is Right<L, R> {
    return true;
  }
}

export const left = <L, R>(value: L): Either<L, R> => new Left(value);
export const right = <L, R>(value: R): Either<L, R> => new Right(value);