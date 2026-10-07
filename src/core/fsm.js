export const States = {
  IDLE: 'IDLE',
  COLLAPSING: 'COLLAPSING',
  STOPPING: 'STOPPING',
  SUPERNOVA: 'SUPERNOVA',
  REVEAL: 'REVEAL'
};

export class StageFSM {
  constructor(callbacks = {}) {
    this.state = States.IDLE;
    this.stateStartTime = performance.now();
    this.callbacks = callbacks;

    this.config = {
      collapseMinDuration: 1500, // 坍缩加速期强锁 1.5 秒，防手滑连按
      stoppingDuration: 1200,    // 阻尼刹车时长
      supernovaDuration: 1200,   // 超新星冲击爆发时长
      revealMinDuration: 1000    // 卡片展示保护期
    };

    this.timer = null;
  }

  getState() {
    return this.state;
  }

  transitionTo(nextState) {
    clearTimeout(this.timer);
    this.state = nextState;
    this.stateStartTime = performance.now();

    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.state);
    }

    if (this.state === States.STOPPING) {
      this.timer = setTimeout(() => {
        this.transitionTo(States.SUPERNOVA);
      }, this.config.stoppingDuration);
    } else if (this.state === States.SUPERNOVA) {
      this.timer = setTimeout(() => {
        this.transitionTo(States.REVEAL);
      }, this.config.supernovaDuration);
    }
  }

  handleInput(action) {
    const elapsed = performance.now() - this.stateStartTime;

    switch (this.state) {
      case States.IDLE:
        if (action === 'TOGGLE') {
          this.transitionTo(States.COLLAPSING);
        }
        break;

      case States.COLLAPSING:
        if (elapsed < this.config.collapseMinDuration) {
          console.warn('[FSM] 坍缩加速中，按键已屏蔽');
          return;
        }
        if (action === 'TOGGLE') {
          this.transitionTo(States.STOPPING);
        }
        break;

      case States.STOPPING:
      case States.SUPERNOVA:
        return; // 过渡演出阶段屏蔽所有按键

      case States.REVEAL:
        if (elapsed < this.config.revealMinDuration) {
          console.warn('[FSM] 卡片展示受保护期，按键已屏蔽');
          return;
        }
        if (action === 'TOGGLE' || action === 'DISMISS') {
          this.transitionTo(States.IDLE);
        }
        break;
    }
  }
}
