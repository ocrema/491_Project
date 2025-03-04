import { Entity } from "../Entities/Entities.js";
import { GAME_ENGINE } from "../main.js";

export class HUD extends Entity {
  constructor() {
    super();
    this.entityOrder = 9999;
    this.healthBarWidthRatio = 0.3;
    this.healthBarHeightRatio = 0.03;
    this.healthBarMarginRatio = 0.03;
    this.enemyHealthBarWidthRatio = 0.1; // smaller than player's
    this.enemyHealthBarHeightRatio = 0.02; // scaled height
    this.debugMode = false;

    // Cursor coordinates
    this.cursorX = 0;
    this.cursorY = 0;

    // Cowboy animation setup (Blinking images)
    this.cowboyImages = [
      "./assets/ui/cowboy.png",
      "./assets/ui/cowboy1.png",
      "./assets/ui/cowboy.png",
      "./assets/ui/cowboy2.png",
    ];

    // Spell switching animation setup
    this.cowboySpellImages = [
      "./assets/ui/cowboy_spell.png", // Transition start
      "./assets/ui/cowboy_spell1.png",
      "./assets/ui/cowboy_spell2.png",
      "./assets/ui/cowboy_spell3.png",
      "./assets/ui/cowboy_spell4.png",
      "./assets/ui/cowboy_spell5.png",
      "./assets/ui/cowboy_spell6.png",
      "./assets/ui/cowboy_spell.png", // Transition end
    ];

    this.cowboyFrameIndex = 0; // Current frame
    this.blinkTimer = 0; // Timer to switch frames
    this.blinkInterval = 1.0; // Change every 0.5 seconds
    this.spellAnimationTimer = 0; // Timer for spell switching animation
    this.spellAnimationDuration = 1.2; // Duration of spell selection animation
    this.attackAnimationTimer = 0;
    this.attackAnimationDuration = 0.8;
    this.isSpellSwitching = false; // Flag to check if spell switching animation is playing
    this.isAttacking = false; 
    this.currentCowboyImage = this.cowboyImages[0]; 
    this.healthFlashTimer = 0; // Timer for flashing effect on hit 
    this.healthFlashDuration = 0.5; // Flash duration in seconds
    this.lastHealth = 0; // Stores the previous health value

    // Spells and cylinder setup
    this.spells = [
      { name: "Fireball", icon: "./assets/ui/spells/fireball.png" },
      { name: "Lightning", icon: "./assets/ui/spells/lightning.png" },
      { name: "Water Wave", icon: "./assets/ui/spells/water.png" },
      { name: "Icicle", icon: "./assets/ui/spells/icicle.png" },
      { name: "Vine Ball", icon: "./assets/ui/spells/vine.png" },
      { name: "Void Orb", icon: "./assets/ui/spells/void.png" },
    ];

    this.activeSpellIndex = 0;
    this.previousSpellIndex = 0;

    // Cylinder animation setup
    this.cylinderImages = [];
    for (let i = 1; i <= 10; i++) {
      this.cylinderImages.push(`./assets/ui/revolver/cylinder${i}.png`);
    }

    this.cylinderRotation = 0; // Current rotation (in radians)
    this.targetRotation = 0; // Target rotation (in radians)
    this.rotationSpeed = 0; // Speed of rotation (radians per frame)
    this.rotationTime = 0; // Time remaining for rotation

    this.gameWon = false; // Flag that swaps after an enemy is killed
  }

  colliding() {
    return false;
  }

  update() {
    const player = GAME_ENGINE.entities.find((e) => e.isPlayer);
    if (!player) return; //check that player exists

    // Ensure the cowboy image is set on the first frame
    if (!this.currentCowboyImage) {
        this.currentCowboyImage = this.cowboyImages[0]; // Default cowboy sprite
    }

    // Detect if player took damage
    if (player.health < this.lastHealth) {
      this.healthFlashTimer = this.healthFlashDuration; // Start flash effect
    }

    this.lastHealth = player.health; // Update last health value

    // Reduce flash timer
    if (this.healthFlashTimer > 0) {
      this.healthFlashTimer -= GAME_ENGINE.clockTick;
    }
    // Detect Spell Switching
    if (player.selectedSpell !== this.previousSpellIndex) {
      this.isSpellSwitching = true;
      this.spellAnimationTimer = this.spellAnimationDuration; // Start animation timer
      this.previousSpellIndex = player.selectedSpell; // Update previous spell index
    }

    // Detect Attack (Left Mouse Button / 'm1')
    if (GAME_ENGINE.keys["m1"] && !this.isAttacking) {
      console.log("ATTACK!!!");
      this.isAttacking = true;
      this.attackAnimationTimer = this.spellAnimationDuration; // Set attack animation timer
    }

    // Handle Cowboy Animation (Spell & Attack Flash)
    if (this.isSpellSwitching == true || this.isAttacking == true) {
      const flashFrameIndex = Math.floor(
        ((this.spellAnimationTimer + this.attackAnimationTimer) / this.spellAnimationDuration) * 6);
        this.currentCowboyImage = `./assets/ui/cowboy_flash${Math.min(flashFrameIndex + 1, 6)}.png`;

      // Reduce animation timers
      if (this.isSpellSwitching) this.spellAnimationTimer -= GAME_ENGINE.clockTick;
      if (this.isAttacking) this.attackAnimationTimer -= GAME_ENGINE.clockTick;

      // End animations when timers expire
      if (this.spellAnimationTimer <= 0) {
        this.isSpellSwitching = false;
      }
      if (this.attackAnimationTimer <= 0) {
        console.log("ATTACK ANIMATION END!");
        this.isAttacking = false;
      }
    } else {
      // Normal Blinking Animation (Slow & Randomized)
      this.blinkTimer += GAME_ENGINE.clockTick;
      if (this.blinkTimer >= this.blinkInterval) {
          this.blinkTimer = 0;
          this.blinkInterval = Math.random() * 3 + 3; // Blink every 3-6 seconds
          this.cowboyFrameIndex = (this.cowboyFrameIndex + 1) % this.cowboyImages.length;
      }
      this.currentCowboyImage = this.cowboyImages[this.cowboyFrameIndex];
    }

    // Sync HUD with Player's selected spell
    this.activeSpellIndex = player.selectedSpell;
    this.rotateCylinder(this.activeSpellIndex, 0.5);

    // Toggle debug mode
    if (GAME_ENGINE.keys["b"]) {
      this.debugMode = !this.debugMode;
      GAME_ENGINE.debug_colliders = this.debugMode;
      ASSET_MANAGER.toggleMute(this.debugMode);
      console.log(`Debug Mode: ${this.debugMode ? "ON" : "OFF"}`);
      GAME_ENGINE.keys["b"] = false;
    }

    // Smooth rotation logic
    if (this.rotationTime > 0) {
      this.cylinderRotation += this.rotationSpeed;
      this.rotationTime -= GAME_ENGINE.clockTick;

      if (this.rotationTime <= 0) {
        this.cylinderRotation = this.targetRotation; // Snap to target
      }
    }
  }

  /**
   * Rotate the cylinder to a given spell index over a set duration.
   * @param {number} pos - The index of the spell to rotate to (0-5).
   * @param {number} time - The duration of the transition (in seconds).
   */
  rotateCylinder(pos, time) {
    const totalSpells = this.spells.length;
    const degreesPerSpell = 360 / totalSpells; // Each spell on circle
    const newRotation = (pos * degreesPerSpell * Math.PI) / 180; // degrees to radians

    // Cancel any current animation and start from the current location
    this.targetRotation = newRotation;
    this.rotationTime = time;
    this.rotationSpeed =
      (this.targetRotation - this.cylinderRotation) /
      (time / GAME_ENGINE.clockTick);
    this.activeSpellIndex = pos;
  }

  selectSpell(index) {
    this.activeSpellIndex = index;
    this.spinTargetFrame = index;
    this.spinning = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformations

    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Get Player
    const player = GAME_ENGINE.entities.find((e) => e.isPlayer);
    if (!player) return; // Ensure player exists

    // Get Assets
    const customFont = ASSET_MANAGER.getAsset("./assets/fonts/texas.ttf");
    //const cowboyImg = ASSET_MANAGER.getAsset("./assets/ui/cowboy.png");
    const spellIcon = ASSET_MANAGER.getAsset(this.spells[this.activeSpellIndex].icon);
    const cylinderImage = ASSET_MANAGER.getAsset(this.cylinderImages[0]);

    // === Font Setup ===
    ctx.fillStyle = "white";
    ctx.font = this.debugMode
        ? `${canvasHeight * 0.025}px Arial`
        : `${canvasHeight * 0.03}px ${customFont || "Arial"}`;
    ctx.textAlign = "center";

    // === Health Bar Setup ===
    const maxHealth = player.maxHealth;
    const currentHealth = Math.max(0, player.health);
    const healthBarWidth = canvasWidth * this.healthBarWidthRatio;
    const healthBarHeight = canvasHeight * this.healthBarHeightRatio;
    const healthBarMargin = canvasHeight * this.healthBarMarginRatio;
    const cowboySize = healthBarHeight * 20;

    const cowboyX = -canvasWidth * 0.0005; // Move cowboy to the right
    const cowboyY = canvasHeight - cowboySize / 1.9; // Move cowboy lower

    const startX = cowboyX + cowboySize / 1.8; // Move health bar closer horizontally
    const startY = canvasHeight - healthBarHeight - healthBarMargin / 1.5; // Move health bar closer vertically

    // Health Ratio and Fill
    const healthRatio = currentHealth / maxHealth;
    const filledWidth = healthBarWidth * healthRatio;
    let healthColor = healthRatio > 0.5 ? "limegreen" : healthRatio > 0.2 ? "red" : "red";

    // === Flash Effect When Hit ===
    if (player.health < this.lastHealth) {
        this.healthFlashTimer = this.healthFlashDuration;
    }
    this.lastHealth = player.health;

    // === Create Gradient for HUD Background ===
    const hudGradient = ctx.createLinearGradient(0, (canvasHeight - 120), 0, canvasHeight);
    hudGradient.addColorStop(0, "rgba(0, 0, 0, 0.01)"); // More transparent at top
    hudGradient.addColorStop(1, "rgba(0, 0, 0, 0.8)"); // Darker at bottom

    // === Draw Gradient HUD Background ===
    ctx.fillStyle = hudGradient;
    ctx.fillRect(0, canvasHeight - 120, canvasWidth, 120); // Covers bottom HUD area
        
    // === Draw Purple Frame Around Health Bar ===
    const framePadding = 4; // Thickness of frame
    ctx.fillStyle = "rgba(179, 16, 179, 0.8)"; // Purple frame
    ctx.fillRect(startX - framePadding, startY - framePadding, healthBarWidth + framePadding * 2, healthBarHeight + framePadding * 2);

    // === Draw Health Bar ===
    ctx.fillStyle = "rgba(50, 50, 50, 0.8)"; // Background
    ctx.fillRect(startX, startY, healthBarWidth, healthBarHeight);

    ctx.fillStyle = this.healthFlashTimer > 0 ? "rgba(255, 0, 0, 0.6)" : healthColor;
    ctx.fillRect(startX, startY, filledWidth, healthBarHeight);

    ctx.fillStyle = this.healthFlashTimer > 0 ? "red" : "white";
    ctx.font = `${canvasHeight * 0.03}px Texas, Arial`;
    ctx.fillText(`HP: ${Math.round(currentHealth)} / ${maxHealth}`, startX + healthBarWidth / 2, startY - 5);

    // === Draw Cowboy Icon ===
    const cowboyImg = ASSET_MANAGER.getAsset(this.currentCowboyImage);
    if (cowboyImg) {
        ctx.drawImage(cowboyImg, cowboyX, cowboyY, cowboySize/2, cowboySize/2);
    }

    // === Spell UI Setup ===
    const scaleFactor = canvasHeight / 800;
    const cylinderSize = 160 * scaleFactor;
    const cylinderX = canvasWidth - cylinderSize - 25 * scaleFactor;
    const cylinderY = canvasHeight - cylinderSize - 25 * scaleFactor;
    const spellTextX = cylinderX - 180 * scaleFactor;
    const spellTextY = cylinderY + cylinderSize / 1.05;

    // === Draw Spell Name & Icon ===
    ctx.fillStyle =  "white";
    ctx.fillText(`Spell: ${this.spells[this.activeSpellIndex].name}`, spellTextX, spellTextY);
    if (spellIcon) {
        const spellIconSize = 60 * scaleFactor;
        ctx.drawImage(spellIcon, spellTextX + 90 * scaleFactor, spellTextY - 50 * scaleFactor, spellIconSize, spellIconSize);
    }

    // === Draw Revolver Cylinder (Rotating & Glowing) ===
    if (cylinderImage) {
      ctx.save();
      
      // Position and rotation
      ctx.translate(cylinderX + cylinderSize / 2, cylinderY + cylinderSize / 2);
      ctx.rotate(this.cylinderRotation);

      // === Glowing Effect Based on Selected Spell ===
      ctx.shadowBlur = 30; // Glow intensity
      ctx.shadowColor = this.getSpellGlowColor(this.activeSpellIndex); // Spell-based glow color

      // Draw the cylinder
      ctx.drawImage(cylinderImage, -cylinderSize / 2, -cylinderSize / 2, cylinderSize, cylinderSize);

      // Reset glow effect after drawing
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // === Game Win Screen ===

    if (this.gameWon) {
      console.log("All enemies are dead! Triggering game over.");
      GAME_ENGINE.GAME_CONTROLLER.setGameOver();

      ctx.fillStyle = "rgba(0, 104, 71, 0.5)"; // Red overlay
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      ctx.fillStyle = "white";
      ctx.font = `${canvasHeight * 0.12}px Texas, Arial`;
      ctx.fillText("GAME WON", canvasWidth / 2, canvasHeight / 2);

      ctx.font = `${canvasHeight * 0.04}px Texas, Arial`;
      ctx.fillText("Press R to Restart", canvasWidth / 2, canvasHeight / 1.5);

      ctx.restore();
      return;
    }

    // === Game Over Screen ===
    if (currentHealth <= 0) {
        console.log("Player health is 0! Triggering Game Over.");
        GAME_ENGINE.GAME_CONTROLLER.setGameOver();

        ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // Red overlay
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = "white";
        ctx.font = `${canvasHeight * 0.12}px Texas, Arial`;
        ctx.fillText("GAME OVER", canvasWidth / 2, canvasHeight / 2);

        ctx.font = `${canvasHeight * 0.04}px Texas, Arial`;
        ctx.fillText("Press R to Restart", canvasWidth / 2, canvasHeight / 1.5);

        ctx.restore();
        return;
    }

    // === Debug Mode UI ===
    if (this.debugMode) {
        ctx.fillStyle = "white";
        ctx.font = `${canvasHeight * 0.025}px Arial`;

        const debugTextX = 90;
        const debugTextY = 40;
        const lineSpacing = canvasHeight * 0.03;
        let debugLine = 0;

        ctx.fillText("DEBUG MODE: ON", debugTextX, debugTextY + debugLine++ * lineSpacing);

        // Get mouse position relative to the game world
        const mouseX = GAME_ENGINE.mouse.x + GAME_ENGINE.camera.x;
        const mouseY = GAME_ENGINE.mouse.y + GAME_ENGINE.camera.y;

        if (player) {
            ctx.fillText(`Player Position: (${Math.floor(player.x)}, ${Math.floor(player.y)})`, debugTextX, debugTextY + debugLine++ * lineSpacing);
            ctx.fillText(`Player Velocity: (${player.x_velocity.toFixed(2)}, ${player.y_velocity.toFixed(2)})`, debugTextX, debugTextY + debugLine++ * lineSpacing);
            ctx.fillText(`Active Spell: ${this.spells[this.activeSpellIndex].name}`, debugTextX, debugTextY + debugLine++ * lineSpacing);
            ctx.fillText(`Health: ${currentHealth} / ${maxHealth}`, debugTextX, debugTextY + debugLine++ * lineSpacing);
            ctx.fillText(`X: ${Math.floor(mouseX)}, Y: ${Math.floor(mouseY)}`, debugTextX, debugTextY + debugLine++ * lineSpacing);
        }
    }

    ctx.restore();
  }

  checkWin(){
    let enemiesDead = true;
    for (let entity of GAME_ENGINE.entities) {
      // if an entity is an enemy and has more than 0 health
      if (entity.isEnemy && entity.health > 0) {
        enemiesDead = false;
      }
    }
    this.gameWon = enemiesDead;
  }

  getSpellGlowColor(spellIndex) {
    const spellGlows = [
        "rgba(255, 68, 0, 0.86)",    // Fireball - Orange Red
        "rgba(229, 232, 50, 0.8)", // Lightning - Light Blue
        "rgba(43, 230, 224, 0.8)",  // Water Wave - Dodger Blue
        "rgba(43, 154, 223, 0.8)", // Icicle - Sky Blue
        "rgba(34, 139, 34, 0.8)",   // Vine Ball - Forest Green
        "rgba(138, 43, 226, 0.8)"   // Void Orb - Blue Violet
    ];
    
    return spellGlows[spellIndex] || "rgba(255, 255, 255, 0.8)"; // Default glow if index is out of range
  }

}
