import { Actor } from "../Entities.js";
import { Player } from "../Player/Player.js";
import { Collider } from "../Collider.js";
import * as Util from "../../Utils/Util.js";
import { CowboyBullet } from "./CowboyEnemy.js"; // Import Cowboy Bullet

export class StaticCowboyEnemy extends Actor {
  constructor(x, y) {
    super();
    Object.assign(this, { x, y });

    this.assetManager = window.ASSET_MANAGER;

    // Load Animations
    this.addAnimation(
      "idle",
      this.assetManager.getAsset("./assets/cowboy/CowBoyIdle.png"),
      48, 48, 7, 0.15
    );

    this.addAnimation(
      "shoot",
      this.assetManager.getAsset("./assets/cowboy/CowBoyShoot.png"),
      48, 48, 5, 0.2
    );

    this.setAnimation("idle"); // Default animation

    this.width = 50;
    this.height = 110;
    this.scale = 3;
    this.health = 20;
    this.maxHealth = 20;
    this.fireRate = 2.5;
    this.attackCooldown = 0;
    this.isEnemy = true;
    this.flip = false; // False = facing right, True = facing left

    this.collider = new Collider(this.width, this.height);

    this.visualRadius = 700; // Detection range
    this.attackRadius = 700; // Attack range (Same as visual range since it only shoots)
    this.seesPlayer = false;
  }

  draw(ctx) {
    if (GAME_ENGINE.debug_colliders) {
      super.draw(ctx);
      ctx.strokeStyle = "red";
      ctx.beginPath();
      ctx.arc(
        this.x - GAME_ENGINE.camera.x,
        this.y - GAME_ENGINE.camera.y,
        this.visualRadius,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    } else {
      super.draw(ctx);
    }
  }

  update() {
    this.attackCooldown += GAME_ENGINE.clockTick;
    this.recieveEffects();

    let playerDetected = false;
    let playerTarget = null;

    for (let entity of GAME_ENGINE.entities) {
      if (entity instanceof Player && Util.canSee(this, entity)) {
        this.seesPlayer = true;
        playerDetected = true;
        playerTarget = entity;

        // **Flip the cowboy based on player's position**
        this.flip = entity.x < this.x; // Flip if player is on the left

        if (this.attackCooldown >= this.fireRate) {
          this.attack(entity);
        }
      }
    }

    // **If no player is detected, return to idle animation**
    if (!playerDetected) {
      this.setAnimation("idle");
    }
  }

  attack(player) {
    this.setAnimation("shoot");
    this.attackCooldown = 0;
    console.log(`Static Cowboy shooting at Player at (${player.x}, ${player.y})`);

    GAME_ENGINE.addEntity(new CowboyBullet(this.x, this.y, player));

    // **Reset back to idle after shooting**
    setTimeout(() => {
      this.setAnimation("idle");
    }, 200); // Adjust timing based on shoot animation duration
  }

  applyDamage() {
    for (let attack of this.recieved_attacks) {
      this.health -= attack.damage;
    }
    this.recieved_attacks = [];

    if (this.health <= 0) {
      this.removeFromWorld = true;
      this.collider = null;
    }
  }
}
