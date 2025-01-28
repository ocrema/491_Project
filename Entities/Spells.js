import { newCollider } from "../Utils/Util.js";
import { Entity } from "./Entities.js";

export class Fireball extends Entity {

    constructor() {
        super();
        this.x = 0;
        this.y = 0;
        this.dir = 0; // in radians
        this.entityOrder = 3;
        this.speed = 1000;
        this.colliders = [newCollider(50, 50, 0, 0)];
        this.isAttack = true;
        this.experationTimer = 3;
        this.exploded = false;

    }

    update() {
        

        if (this.exploded) {
            this.experationTimer -= GAME_ENGINE.clockTick;
            if (this.experationTimer <= 0) this.removeFromWorld = true;
            return;
        }

        this.x += Math.cos(this.dir) * this.speed * GAME_ENGINE.clockTick;
        this.y += Math.sin(this.dir) * this.speed * GAME_ENGINE.clockTick;

        for (let e of GAME_ENGINE.entities) {
            if (e.isPlayer || e.isAttack) continue;
            
            if (this.colliding(e)) {
                this.exploded = true;
                this.colliders[0].width = 200;
                this.colliders[0].height = 200;

                for (let e2 of GAME_ENGINE.entities) {
                    if (!e2.isActor) continue;
                    if (this.colliding(e2)) {
                        e2.queueAttack({damage: 10, x: this.x, y: this.y, burn: 5, launchMagnitude: 1000});
                    }
                }
                this.colliders = [];
                this.experationTimer = .5;
                break;
            }
        }

        this.experationTimer -= GAME_ENGINE.clockTick;
        if (this.experationTimer <= 0) this.removeFromWorld = true;
    }

    draw(ctx) {
        ctx.fillStyle = "red";
        if (this.exploded)
            ctx.fillRect(this.x - 100 - GAME_ENGINE.camera.x, this.y - 100 - GAME_ENGINE.camera.y, 200, 200);
        else
            ctx.fillRect(this.x - 25 - GAME_ENGINE.camera.x, this.y - 25 - GAME_ENGINE.camera.y, 50, 50);
    }

}