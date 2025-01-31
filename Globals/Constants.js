// Background Spritesheet Constants

export const BACKGROUND_SPRITESHEET = {
  URL: "./assets/background/background.png",
  FRAME_WIDTH: 800,
  FRAME_HEIGHT: 336,
  FRAME_COUNT: 8,
  FRAME_DURATION: 0.1,
};

// PLAYER SECTION //
// All things player related are stored here
// Spritesheets
// Collider values

// Player Spritesheet Constants

export const PLAYER_SPRITESHEET = {
  IDLE: {
    NAME: "IDLE",
    URL: "./assets/player/Idle.png",
    FRAME_WIDTH: 231,
    FRAME_HEIGHT: 190,
    FRAME_COUNT: 6,
    FRAME_DURATION: 0.2,
  },
  RUN: {
    NAME: "RUN",
    URL: "./assets/player/Run.png",
    FRAME_WIDTH: 231,
    FRAME_HEIGHT: 190,
    FRAME_COUNT: 8,
    FRAME_DURATION: 0.1,
  },
  JUMP: {
    NAME: "JUMP",
    URL: "./assets/player/Jump.png",
    FRAME_WIDTH: 231,
    FRAME_HEIGHT: 190,
    FRAME_COUNT: 2,
    FRAME_DURATION: 0.5,
  },
  ATTACK1: {
    NAME: "ATTACK1",
    URL: "./assets/player/Attack1.png",
    FRAME_WIDTH: 231,
    FRAME_HEIGHT: 190,
    FRAME_COUNT: 8,
    FRAME_DURATION: 0.075,
  },
  ATTACK2: {
    NAME: "ATTACK2",
    URL: "./assets/player/Attack2.png",
    FRAME_WIDTH: 231,
    FRAME_HEIGHT: 190,
    FRAME_COUNT: 8,
    FRAME_DURATION: 0.075,
  },
  FALL: {
    NAME: "FALL",
    URL: "./assets/player/Fall.png",
    FRAME_WIDTH: 231,
    FRAME_HEIGHT: 190,
    FRAME_COUNT: 2,
    FRAME_DURATION: 0.5,
  },
  HIT: {
    NAME: "HIT",
    URL: "./assets/player/Hit.png",
    FRAME_WIDTH: 231,
    FRAME_HEIGHT: 190,
    FRAME_COUNT: 1,
    FRAME_DURATION: 1,
  },
  DEAD: {
    NAME: "DEAD",
    URL: "./assets/player/Death.png",
    FRAME_WIDTH: 231,
    FRAME_HEIGHT: 190,
    FRAME_COUNT: 7,
    FRAME_DURATION: 0.25,
  },
};

// Player Collider Constants

export const PLAYER_COLLIDER = {
  WIDTH: 70,
  HEIGHT: 130,
  OFFSET_X: -11,
  OFFSET_Y: 0,
};
