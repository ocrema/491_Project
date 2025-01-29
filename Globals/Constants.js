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
    FRAME_DURATION: 0.25,
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
  FALL: {
    NAME: "FALL",
    URL: "./assets/player/Fall.png",
    FRAME_WIDTH: 231,
    FRAME_HEIGHT: 190,
    FRAME_COUNT: 2,
    FRAME_DURATION: 0.5,
  },
  DEAD: {
    NAME: "DEAD",
    URL: "./assets/player/Death.png",
    FRAME_WIDTH: 231,
    FRAME_HEIGHT: 190,
    FRAME_COUNT: 7,
    FRAME_DURATION: 0.1,
  },
};

// Player Collider Constants

export const PLAYER_COLLIDER = {
  WIDTH: 70,
  HEIGHT: 130,
  OFFSET_X: -11,
  OFFSET_Y: 0,
};

// Enemy Spritesheet Constants

export const ENEMY_SPRITESHEET = {
  IDLE: {
    URL: "./assets/enemy/Idle.png",
    FRAME_WIDTH: 231,
    FRAME_HEIGHT: 190,
    FRAME_COUNT: 6,
    FRAME_DURATION: 0.25,
  },
  RUN: {
    URL: "./assets/enemy/Run.png",
    FRAME_WIDTH: 231,
    FRAME_HEIGHT: 190,
    FRAME_COUNT: 8,
    FRAME_DURATION: 0.1,
  },
  JUMP: {
    URL: "./assets/enemy/Jump.png",
    FRAME_WIDTH: 231,
    FRAME_HEIGHT: 190,
    FRAME_COUNT: 8,
    FRAME_DURATION: 0.1,
  },
  DEAD: {
    URL: "./assets/enemy/Death.png",
    FRAME_WIDTH: 231,
    FRAME_HEIGHT: 190,
    FRAME_COUNT: 7,
    FRAME_DURATION: 0.1,
  },
};
