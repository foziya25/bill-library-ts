export class RoundOffObj {
  baseRoundOff: number;
  roundUp: boolean;
  roundOffClose: boolean;
  roundDown: boolean;

  constructor() {
    this.baseRoundOff = 0.05;
    this.roundUp = false;
    this.roundOffClose = false;
    this.roundDown = false;
  }
}
