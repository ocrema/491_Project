import { Entity } from "./Entities.js";
import * as Util from "../Utils/Util.js"
import { Collider } from "./Collider.js";
import { Player } from "./Player/Player.js";
import { GAME_ENGINE } from "../main.js";
export class Stampede extends Entity {
    constructor(path) {
        super();
        // this.path = [{x: 2700, y: 160}, {x: -2700, y: 160}];
        Object.assign(this, { path });

        // Animation 

        this.assetManager = window.ASSET_MANAGER;
        this.addAnimation(
            "stampede",
            this.assetManager.getAsset("./assets/enemy/stampede/horse.png"),
            100, // Frame width
            48, // Frame height
            6, // Frame count
            0.115 // Frame duration (slower for idle)
        );

        this.setAnimation("stampede");
        this.scale = 4;        
        this.width = 100;
        this.height = 100;
        this.x = this.path[0].x + (this.width/2);
        this.y = this.path[0].y - (this.height/2);
        this.entityOrder = 1;

        // Movement
        this.speed = 5;

        var distance = Util.getDistance(this, this.path[1]);
        this.velocity = {
            x: ((this.path[1].x - this.x) / distance) * this.speed,
            y: ((this.path[1].y - this.y) / distance) * this.speed,
        };

        // Damage
        this.collider = new Collider(this.width, this.height);
        this.data = {damage: 10};
        this.attackTime = 2;
        this.attackCooldown = 2;

        // Flags

        this.isAttack = true;
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        this.attackTime += GAME_ENGINE.clockTick;

        for (let entity of GAME_ENGINE.entities) {
        if (
            entity instanceof Player &&
            entity.collider &&
            this.colliding(entity) &&
            this.attackTime > this.attackCooldown
        ) {
            this.attackTime = 0;
            entity.queueAttack(this.data);
            }
        }

        if (Util.getDistance(this.path[1], this) < 10) {
            this.removeFromWorld = true;
        }

        this.updateAnimation(GAME_ENGINE.clockTick);
    }

}