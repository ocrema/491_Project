import { Entity } from "../Entities.js";
import { Actor } from "../Actor.js";
import { PLAYER_SPRITESHEET } from "../../Globals/Constants.js";
import * as Util from "../../Utils/Util.js";
import { Fireball } from "../Spells/Fireball.js";
import { ChainLightning } from "../Spells/ChainLightning.js";
import { Collider } from "../Collider.js";
import { GAME_ENGINE } from "../../main.js";
import { WaterWave } from "../Spells/WaterWave.js";
import { Icicle } from "../Spells/Icicle.js";
import { VoidOrb } from "../Spells/VoidOrb.js";
import { VineGrapple } from "../Spells/VineGrapple.js";
import { AnimationLoader } from "../../Core/AnimationLoader.js";
import { SpawnPointTile } from "../Map/Tiles/SpawnPointTile.js";
import { GameEngine } from "../../Core/GameEngine.js";

export class Player extends Actor {
  constructor(x, y) {
    super();
    // Assigns asset manager from window asset manager singleton
    this.assetManager = window.ASSET_MANAGER;
    this.scale = 0.3;
    this.x = x;
    this.y = y;
    this.spawnX = x;
    this.spawnY = y;

    this.isPlayer = true;

    // switches between attack animations for the player
    this.attackState = 1;

    // Adds all player animations
    this.playerAnimationLoader = new AnimationLoader(this);
    this.playerAnimationLoader.loadAnimations(PLAYER_SPRITESHEET);

    this.speed = 800; // Movement speed
    this.isMoving = false; // Whether the player is moving
    this.health = 400;
    this.maxHealth = 400;
    this.isLaunchable = true;
    this.validEffects = {};

    // Start with the idle animation
    this.setAnimation(PLAYER_SPRITESHEET.IDLE.NAME);

    this.collider = new Collider(65, 110);

    this.x_velocity = 0;
    this.y_velocity = 0;
    this.jumpForce = -1700;
    this.isGrounded = 0; // values above 0 indicate that the player is grounded, so the player can still jump for a little bit after falling off a platform

    this.selectedSpell = 0;
    this.spellCooldowns = [0, 0, 0, 0, 0, 0];
    this.maxSpellCooldown = 1.5;
    this.spellColors = [
      "orange",
      "limegreen",
      "cyan",
      "blue",
      "yellow",
      "purple",
    ];

    this.timeBetweenFootsteps = 0.4;
    this.timeSinceLastFootstep = 0.4;

    this.isDashing = 0;
    this.dashTime = 0.15;
    this.dashSpeed = 700;
    this.storedDashSpeed = 0;
    this.dashCooldown = 0;

    this.wallGrabState = 0;

    this.jumpCooldown = 0;
    this.isGroundSlamming = false;
    this.groundSlamSpeed = 3000;

    this.gun_offset = { x: 30, y: 25 };
    this.gun_spin = null;
    this.gun_spin_speed = 30;
    this.gun_spin_to = 0;
  }

  heal(amount) {
    console.log(`Healing Player: +${amount} HP`);

    // Forcefully increase health
    let oldHealth = this.health;
    this.health = Math.min(this.maxHealth, this.health + amount);
    GAME_ENGINE.addEntity(new HealDust(this));

    //console.log(` Player Health Before: ${oldHealth}, After: ${this.health}`);

    // Ensure the update is visible in the HUD (if applicable)
    if (this.hud) {
      this.hud.updateHealth(this.health);
    }
  }

  setSpawnPoint(x, y) {
    //if (this.spawnX === x && this.spawnY === y) return;
    window.ASSET_MANAGER.playAsset("./assets/sfx/checkpoint.ogg");
    this.spawnX = x;
    this.spawnY = y;

    //console.log(`Player respawn point set at ${x}, ${y}`);

    // for (let entity of GAME_ENGINE.entities) {
    //   if (entity instanceof SpawnPointTile && entity.x === this.spawnX) {
    //     entity.respawnEnemies(); // Call respawnEnemies() on respawn
    //   }
    // }
  }

  respawn() {
    this.isDead = false;
    this.health = this.maxHealth;
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.setAnimation(PLAYER_SPRITESHEET.IDLE.NAME);
    this.selectedSpell = 0;
    this.spellCooldowns = [0, 0, 0, 0, 0, 0];
    this.isDashing = 0;
    this.dashCooldown = 0;
    this.wallGrabState = 0;
    this.jumpCooldown = 0;
    this.isGroundSlamming = false;
    this.gun_spin = null;
    this.x_velocity = 0;
    this.y_velocity = 0;
    GAME_ENGINE.camera.x = this.x;
    GAME_ENGINE.camera.y = this.y;
    //this.setSpawnPoint(this.x, this.y);
  }

  update() {
    if (GAME_ENGINE.debug_colliders) {
      this.health = 1000000;
      this.jumpForce = -2100;
      this.speed = 2000;
      this.maxSpellCooldown = 1;
    } else {
      this.speed = 750;
      this.jumpForce = -1700;
    }
    this.isMoving = false;
    this.isJumping = false;

    // Player Reset Button - this is if the player dies, this resets player health and respawns them.
    if (GAME_ENGINE.keys["h"]) {
      this.respawn();
    }

    this.movement();

    this.spells();

    // footstep sfx
    if (this.isMoving && this.isGrounded) {
      this.timeSinceLastFootstep += GAME_ENGINE.clockTick;
      if (this.timeSinceLastFootstep >= this.timeBetweenFootsteps) {
        this.timeSinceLastFootstep = 0;
        window.ASSET_MANAGER.playAsset("./assets/sfx/footstep.wav");
      }
    }

    // Player State Logic
    if (!this.isDead) {
      if (this.hitTimer > 0) {
        this.hitTimer -= GAME_ENGINE.clockTick;
      } else if (this.currentAnimation === PLAYER_SPRITESHEET.ATTACK1.NAME) {
        // Do nothing, let the attack animation play out
      } else {
        // Only switch animations if the hit animation is NOT playing
        if (!this.isGrounded) {
          if (this.y_velocity < 0) {
            this.setAnimation(PLAYER_SPRITESHEET.JUMP.NAME);
          } else {
            this.setAnimation(PLAYER_SPRITESHEET.FALL.NAME);
          }
        } else if (this.isMoving) {
          this.setAnimation(PLAYER_SPRITESHEET.RUN.NAME);
        } else {
          this.setAnimation(PLAYER_SPRITESHEET.IDLE.NAME);
        }
      }
    } else {
      this.setAnimation(PLAYER_SPRITESHEET.DEAD.NAME, false);
    }

    if (
      this.recieved_attacks.length > 0 &&
      this.currentAnimation !== PLAYER_SPRITESHEET.HIT.NAME
    ) {
      for (let a of this.recieved_attacks) {
        if (a.damage) {
          this.setAnimation(PLAYER_SPRITESHEET.HIT.NAME);
          this.hitTimer = 0.2;
          break;
        }
      }
    }

    this.recieveAttacks();
    this.recieveEffects();
    if (GAME_ENGINE.keys["]"]) {
      this.health = 0;
    }

    if (this.health <= 0) {
      this.isDead = true;
      this.setAnimation(PLAYER_SPRITESHEET.DEAD.NAME, false);
      //console.log("i died");
    }

    // Update the active animation
    this.updateAnimation(GAME_ENGINE.clockTick);
  }

  onAnimationComplete() {
    // Check if the current animation is the attack animation
    if (
      this.currentAnimation === PLAYER_SPRITESHEET.ATTACK1.NAME
      //this.currentAnimation === PLAYER_SPRITESHEET.ATTACK2.NAME
    ) {
      // Switch back to the idle animation after the attack animation completes
      this.setAnimation(PLAYER_SPRITESHEET.IDLE.NAME);
    }
  }

  movement() {
    //gravity
    this.y_velocity = Math.min(
      this.y_velocity + GAME_ENGINE.clockTick * 3000,
      3000
    );

    // air resistance / friction basically
    if (this.x_velocity > 0) {
      this.x_velocity = Math.max(
        this.x_velocity -
          GAME_ENGINE.clockTick *
            (this.isGrounded == 0.2 || GAME_ENGINE.keys["a"] ? 9000 : 1000),
        0
      );
    } else {
      this.x_velocity = Math.min(
        this.x_velocity +
          GAME_ENGINE.clockTick *
            (this.isGrounded == 0.2 || GAME_ENGINE.keys["d"] ? 9000 : 1000),
        0
      );
    }

    if (this.isDashing > 0) {
      this.y_velocity = 0;
      this.x_velocity = this.storedDashSpeed;
      this.isDashing -= GAME_ENGINE.clockTick;
    }

    if (
      GAME_ENGINE.keys["a"] &&
      !GAME_ENGINE.keys["d"] &&
      GAME_ENGINE.keys["Shift"] &&
      this.dashCooldown <= 0
    ) {
      this.storedDashSpeed = Math.min(this.x_velocity, this.dashSpeed * -1);
      this.isDashing = this.dashTime;
      this.dashCooldown = 0.5;
      window.ASSET_MANAGER.playAsset("./assets/sfx/jump.ogg");
      GAME_ENGINE.addEntity(
        new DashDust(this.x, this.y + this.collider.height / 2, true)
      );
    } else if (
      GAME_ENGINE.keys["d"] &&
      !GAME_ENGINE.keys["a"] &&
      GAME_ENGINE.keys["Shift"] &&
      this.dashCooldown <= 0
    ) {
      this.storedDashSpeed = Math.max(this.x_velocity, this.dashSpeed);
      this.isDashing = this.dashTime;
      this.dashCooldown = 0.5;
      window.ASSET_MANAGER.playAsset("./assets/sfx/jump.ogg");
      GAME_ENGINE.addEntity(
        new DashDust(this.x, this.y + this.collider.height / 2)
      );
    }

    this.dashCooldown = Math.max(this.dashCooldown - GAME_ENGINE.clockTick, 0);
    this.jumpCooldown = Math.max(this.jumpCooldown - GAME_ENGINE.clockTick, 0);

    // jump
    if (
      GAME_ENGINE.keys[" "] &&
      this.isGrounded > 0 &&
      this.isDashing <= 0 &&
      this.jumpCooldown <= 0
    ) {
      this.isGrounded = 0;
      //this.jumpCooldown = 0.4;
      GAME_ENGINE.keys[" "] = false;
      this.y_velocity = this.jumpForce; // Jumping velocity
      this.setAnimation(PLAYER_SPRITESHEET.JUMP.NAME);
      this.isJumping = true;
      window.ASSET_MANAGER.playAsset("./assets/sfx/jump.ogg");
    } else if (
      GAME_ENGINE.keys[" "] &&
      this.wallGrabState !== 0 &&
      this.isDashing <= 0 &&
      this.jumpCooldown <= 0 &&
      this.wallJumps > 0
    ) {
      //this.jumpCooldown = 0.4;
      this.wallJumps--;
      GAME_ENGINE.keys[" "] = false;
      this.y_velocity = this.jumpForce;
      this.x_velocity = -500 * this.wallGrabState;
      this.setAnimation(PLAYER_SPRITESHEET.JUMP.NAME);
      this.isJumping = true;
      window.ASSET_MANAGER.playAsset("./assets/sfx/jump.ogg");
    }

    // Movement logic

    let velFromKeys = 0;
    if (
      GAME_ENGINE.keys["a"] ||
      (this.isDashing > 0 && this.storedDashSpeed < 0)
    ) {
      velFromKeys -= this.speed;
      this.isMoving = true;
      this.flip = true;
    }
    if (
      GAME_ENGINE.keys["d"] ||
      (this.isDashing > 0 && this.storedDashSpeed > 0)
    ) {
      velFromKeys += this.speed;
      this.isMoving = true;
      this.flip = false;
    }

    // Player Collision Logic

    let hitSomething = false;

    if (!this.isGroundSlamming) {
      // make disired movement in x direction
      this.x += (this.x_velocity + velFromKeys) * GAME_ENGINE.clockTick;

      // for all of the entities i am colliding with, move the player as far back as i need to to not be colliding with any of them

      for (let e of GAME_ENGINE.entities) {
        if (
          e.isPlayer ||
          e.isAttack ||
          e.isEnemy ||
          e.isEffect ||
          e.isDestructibleObject ||
          e.isSpike ||
          e.isSpawnPoint ||
          e.isBackgroundTrigger ||
          e.isPickup ||
          e.isWater
        )
          continue;
        //if (e.isEnemy) console.log("NO ENEMIES" + e);
        if (this.colliding(e)) {
          hitSomething = true;
          this.moveAgainstX(e);
        }
      }
      if (hitSomething) {
        if (velFromKeys !== 0 && this.isGrounded !== 0.2) {
          this.wallGrabState = velFromKeys > 0 ? 1 : -1;
          //this.y_velocity = Math.min(this.y_velocity, 100);
        } else {
          this.wallGrabState = 0;
        }
        this.x_velocity = 0;
      } else {
        this.wallGrabState = 0;
      }
    }

    if (GAME_ENGINE.keys["s"] && this.isGrounded < 0.15) {
      this.isGroundSlamming = true;
      this.wallGrabState = 0;
    }
    if (this.isGroundSlamming) {
      this.y_velocity = this.groundSlamSpeed;
    }

    this.isGrounded = Math.max(this.isGrounded - GAME_ENGINE.clockTick, 0);

    // make disired movement in y direction
    this.y += this.y_velocity * GAME_ENGINE.clockTick;

    // for all of the entities i am colliding with, move the player as far back as i need to to not be colliding with any of them
    hitSomething = false;
    for (let e of GAME_ENGINE.entities) {
      if (
        e.isPlayer ||
        e.isAttack ||
        e.isEnemy ||
        e.isDestructibleObject ||
        e.isSpike ||
        e.isSpawnPoint ||
        e.isBackgroundTrigger ||
        e.isWater
      )
        continue;

      if (this.colliding(e)) {
        hitSomething = true;
        this.moveAgainstY(e);
      }
    }
    if (hitSomething) {
      if (this.y_velocity > 0) {
        this.isGrounded = 0.2;
        this.isGroundSlamming = false;
      }
      if (this.y_velocity > 300) {
        window.ASSET_MANAGER.playAsset("./assets/sfx/landing.wav", 1.5);
        GAME_ENGINE.addEntity(
          new LandingDust(this.x, this.y + this.collider.height / 2)
        );
      }
      this.y_velocity = 0; // if hit something cancel velocity
    }

    if (this.isGrounded == 0.2) {
      this.wallJumps = 1;
    }
  }

  spells() {
    // Player Attack Logic

    for (let i = 0; i < this.spellCooldowns.length; i++) {
      this.spellCooldowns[i] = Math.max(
        this.spellCooldowns[i] - GAME_ENGINE.clockTick,
        0
      );
      const key = (i + 1).toString();
      if (GAME_ENGINE.keys[key]) {
        GAME_ENGINE.keys[key] = false;
        this.selectedSpell = i;
        //window.ASSET_MANAGER.playAsset("./assets/sfx/click1.ogg");
      }
    }
    if (GAME_ENGINE.keys["q"] || GAME_ENGINE.keys["wheelUp"]) {
      GAME_ENGINE.keys["q"] = false;
      GAME_ENGINE.keys["wheelUp"] = false;
      this.selectedSpell--;
      if (this.selectedSpell < 0) this.selectedSpell = 5;
      //console.log(this.selectedSpell);
      //window.ASSET_MANAGER.playAsset("./assets/sfx/click1.ogg");
    }
    if (GAME_ENGINE.keys["e"] || GAME_ENGINE.keys["wheelDown"]) {
      GAME_ENGINE.keys["e"] = false;
      GAME_ENGINE.keys["wheelDown"] = false;
      this.selectedSpell++;
      if (this.selectedSpell > 5) this.selectedSpell = 0;
      //window.ASSET_MANAGER.playAsset("./assets/sfx/click1.ogg");
    }

    // cast spell

    this.dir = Util.getAngle(
      {
        x: this.x - GAME_ENGINE.camera.x,
        y: this.y - GAME_ENGINE.camera.y,
      },
      {
        x: GAME_ENGINE.mouse.x,
        y: GAME_ENGINE.mouse.y,
      }
    );
    this.flip = this.dir > Math.PI / 2 || this.dir < -Math.PI / 2;

    if (
      this.spellCooldowns[this.selectedSpell] <= 0 &&
      GAME_ENGINE.keys["m1"]
    ) {
      // Calculate direction to mouse
      const mouseX = GAME_ENGINE.mouse.x + GAME_ENGINE.camera.x;
      //this.flip = mouseX < this.x; // Flip player based on mouse position
      this.setAnimation(PLAYER_SPRITESHEET.ATTACK1.NAME, false);
      this.spellCooldowns[this.selectedSpell] = this.maxSpellCooldown;
      window.ASSET_MANAGER.playAsset("./assets/sfx/revolver_shot.ogg", 1);

      this.gun_spin = this.dir;
      this.gun_spin_to = this.dir - Math.PI * 2;

      if (this.selectedSpell === 0) {
        GAME_ENGINE.addEntity(new Fireball(this, this.dir, this.gun_offset));
      } else if (this.selectedSpell === 1) {
        GAME_ENGINE.addEntity(new VineGrapple(this, this.dir, this.gun_offset));
      } else if (this.selectedSpell === 2) {
        GAME_ENGINE.addEntity(new Icicle(this, this.dir, this.gun_offset));
      } else if (this.selectedSpell === 3) {
        GAME_ENGINE.addEntity(new WaterWave(this, this.dir, this.gun_offset));
      } else if (this.selectedSpell === 4) {
        GAME_ENGINE.addEntity(
          new ChainLightning(this, this.dir, this.gun_offset)
        );
      } else if (this.selectedSpell === 5) {
        GAME_ENGINE.addEntity(new VoidOrb(this, this.dir, this.gun_offset));
      }
    }

    if (this.gun_spin !== null) {
      this.gun_spin -= this.gun_spin_speed * GAME_ENGINE.clockTick;
      if (this.gun_spin < this.gun_spin_to) {
        this.gun_spin = null;
        window.ASSET_MANAGER.playAsset("./assets/sfx/gunspin.ogg", 3);
      }
    }
  }

  draw(ctx) {
    super.draw(ctx);
    // gun
    ctx.save();
    ctx.translate(this.x - GAME_ENGINE.camera.x, this.y - GAME_ENGINE.camera.y);
    ctx.scale(this.flip ? -1 : 1, 1);
    ctx.translate(this.gun_offset.x, this.gun_offset.y);

    let dir;
    if (this.gun_spin !== null) dir = this.gun_spin;
    else dir = this.dir;
    ctx.rotate(this.flip ? -dir + Math.PI : dir);
    ctx.shadowColor = this.spellColors[this.selectedSpell];
    ctx.shadowBlur = 30;
    const scale = 2.5;
    ctx.drawImage(
      this.assetManager.getAsset("./assets/player/gun.png"),
      -3 * scale,
      -8 * scale,
      32 * scale,
      16 * scale
    );
    ctx.restore();
  }
}

class LandingDust extends Entity {
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
    this.time = 0;
    this.end = 0.5;
    this.entityOrder = 3;
    this.image = window.ASSET_MANAGER.getAsset(
      "./assets/effects/dust/landingdust.png"
    );
    this.scale = 5;
  }
  update() {
    this.time += GAME_ENGINE.clockTick;
    if (this.time >= this.end) {
      this.removeFromWorld = true;
    }
  }
  draw(ctx) {
    const frame = Math.floor((this.time / this.end) * 7);
    ctx.save();
    ctx.translate(this.x - GAME_ENGINE.camera.x, this.y - GAME_ENGINE.camera.y);

    ctx.drawImage(
      this.image,
      frame * 32,
      0,
      32,
      16,
      (-32 * this.scale) / 2,
      -16 * this.scale,
      32 * this.scale,
      16 * this.scale
    );

    ctx.restore();
  }
}

class DashDust extends Entity {
  constructor(x, y, flip) {
    super();
    this.x = x;
    this.y = y;
    this.time = 0;
    this.end = 0.5;
    this.entityOrder = 3;
    this.image = window.ASSET_MANAGER.getAsset(
      "./assets/effects/dust/dashdust.png"
    );
    this.scale = 3;
    this.flip = flip;
  }
  update() {
    this.time += GAME_ENGINE.clockTick;
    if (this.time >= this.end) {
      this.removeFromWorld = true;
    }
  }
  draw(ctx) {
    const frame = Math.floor((this.time / this.end) * 8);
    ctx.save();
    ctx.translate(this.x - GAME_ENGINE.camera.x, this.y - GAME_ENGINE.camera.y);
    if (this.flip) {
      ctx.scale(-1, 1);
      //ctx.translate(-this.x * 2, 0);
    }

    ctx.drawImage(
      this.image,
      frame * 48,
      0,
      48,
      32,
      (-48 * this.scale) / 2,
      -32 * this.scale,
      48 * this.scale,
      32 * this.scale
    );

    ctx.restore();
  }
}

class HealDust extends Entity {
  constructor(player) {
    super();
    this.player = player;
    this.x = this.player.x;
    this.y = this.player.y + this.player.collider.height;
    this.time = 0;
    this.end = 1;
    this.entityOrder = 3;
    this.image = window.ASSET_MANAGER.getAsset(
      "./assets/effects/healing/heal.png"
    );
    this.scale = 2;
  }
  update() {
    this.x = this.player.x;
    this.y = this.player.y + (this.player.collider.height / 2) * this.scale;
    this.time += GAME_ENGINE.clockTick;
    if (this.time >= this.end) {
      this.removeFromWorld = true;
    }
  }
  draw(ctx) {
    const frame = Math.floor((this.time / this.end) * 14);
    ctx.save();
    ctx.translate(this.x - GAME_ENGINE.camera.x, this.y - GAME_ENGINE.camera.y);

    ctx.drawImage(
      this.image,
      frame * 128,
      0,
      128,
      128,
      (-128 * this.scale) / 2,
      -128 * this.scale,
      128 * this.scale,
      128 * this.scale
    );

    ctx.restore();
  }
}
