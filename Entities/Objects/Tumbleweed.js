import { Entity } from "../Entities.js";
import { Collider } from "../Collider.js";
import { GAME_ENGINE } from "../../main.js";
import { BurningEffect } from "../Effects/BurningEffect.js";
import { DESTRUCTIBLE_OBJECTS_SPRITESHEET } from "../../Globals/Constants.js";
import { Tile } from "../Map/Tile.js";

export class Tumbleweed extends Entity {
  constructor(x, y, direction = "right") {
    super();
    this.x = x;
    this.y = y;
    this.entityOrder = 2; // Render below spells
    this.assetManager = window.ASSET_MANAGER;
    this.direction = direction;
    this.speed = 250; // Horizontal movement speed
    this.rotation = 0; // Rotation angle
    this.rotationSpeed = 0.1; // Speed of rolling rotation
    this.scale = 0.35; // Scale the sprite
    this.isDestructibleObject = true;
    this.isTumbleweed = true;
    this.isBurning = false; // Track if burning effect is active

    // Gravity & Bouncing
    this.y_velocity = 0; // Vertical speed
    this.gravity = 1000; // Gravity acceleration
    this.bounceFactor = 0.5;
    this.minBounce = 200;
    this.maxBounce = 400;
    this.bounceDecay = 0.8;

    // Load tumbleweed animation
    this.addAnimation(
      DESTRUCTIBLE_OBJECTS_SPRITESHEET.TUMBLEWEED.NAME,
      this.assetManager.getAsset(
        DESTRUCTIBLE_OBJECTS_SPRITESHEET.TUMBLEWEED.URL
      ),
      DESTRUCTIBLE_OBJECTS_SPRITESHEET.TUMBLEWEED.FRAME_WIDTH,
      DESTRUCTIBLE_OBJECTS_SPRITESHEET.TUMBLEWEED.FRAME_HEIGHT,
      DESTRUCTIBLE_OBJECTS_SPRITESHEET.TUMBLEWEED.FRAME_COUNT,
      DESTRUCTIBLE_OBJECTS_SPRITESHEET.TUMBLEWEED.FRAME_DURATION
    );

    this.setAnimation(DESTRUCTIBLE_OBJECTS_SPRITESHEET.TUMBLEWEED.NAME);

    this.colliderScale = 0.8;
    this.collider = new Collider(
      DESTRUCTIBLE_OBJECTS_SPRITESHEET.TUMBLEWEED.FRAME_HEIGHT *
        this.scale *
        this.colliderScale,
      DESTRUCTIBLE_OBJECTS_SPRITESHEET.TUMBLEWEED.FRAME_WIDTH *
        this.scale *
        this.colliderScale
    );
  }

  update() {
    this.y_velocity += this.gravity * GAME_ENGINE.clockTick;
    this.y += this.y_velocity * GAME_ENGINE.clockTick;

    // Move horizontally based on direction
    let moveX = this.speed * GAME_ENGINE.clockTick;
    if (this.direction === "left") moveX = -moveX;
    this.x += moveX;

    // Rotate the tumbleweed
    this.rotation += moveX / 50;

    for (let e of GAME_ENGINE.entities) {
      if (e.isGround && this.colliding(e)) {
        if (e.collider.height > e.collider.width) {
          this.bounceOffObject(e); // Treats tall objects as walls
        } else {
          this.bounceOffGround(e);
        }
        break;
      }
    }

    for (let e of GAME_ENGINE.entities) {
      if (e.isFireballEffect && this.colliding(e)) {
        this.onFireballHit(e);
        e.removeFromWorld = true;
      }
    }

    this.updateAnimation(GAME_ENGINE.clockTick);
  }

  bounceOffGround(ground) {
    this.y = ground.y - ground.collider.height / 2 - this.collider.height / 2;
    this.y_velocity = -(
      Math.random() * (this.maxBounce - this.minBounce) +
      this.minBounce
    );
  }

  bounceOffObject(object) {
    // Reverse direction
    this.direction = this.direction === "right" ? "left" : "right";

    // Reduce speed slightly for realism
    this.speed *= this.bounceDecay;

    // Apply a small bounce effect
    this.y_velocity = -(
      Math.random() * (this.maxBounce - this.minBounce) +
      this.minBounce
    );

    // Prevent sticking inside the object by slightly moving it away
    if (this.direction === "right") {
      this.x = object.x + object.collider.width / 2 + this.collider.width / 2;
    } else {
      this.x = object.x - object.collider.width / 2 - this.collider.width / 2;
    }
  }

  /**
   * Handles when the tumbleweed is hit by a fireball.
   */
  onFireballHit() {
    if (this.isBurning) return; // Prevent multiple burns

    //console.log("🔥 Tumbleweed is now burning!");
    this.isBurning = true;

    // 60 as y offset to center burning effect
    GAME_ENGINE.addEntity(new BurningEffect(this));
  }

  draw(ctx) {
    if (!this.animations[this.currentAnimation]) return;
    const animation = this.animations[this.currentAnimation];

    ctx.save();
    ctx.translate(this.x - GAME_ENGINE.camera.x, this.y - GAME_ENGINE.camera.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);

    ctx.drawImage(
      animation.spritesheet,
      this.currentFrame * animation.frameWidth,
      0,
      animation.frameWidth,
      animation.frameHeight,
      -animation.frameWidth / 2,
      -animation.frameHeight / 2,
      animation.frameWidth,
      animation.frameHeight
    );

    ctx.restore();
  }
}
