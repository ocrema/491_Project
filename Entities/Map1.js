import { GameMap } from "./Entities.js";
import { Player } from "./Player/Player.js";
import { Background } from "./Background.js";
import { Cactus, Spider } from "./Enemy.js";
import { Structure } from "./Structure.js";
import { GAME_ENGINE } from "../main.js";
import { Platform } from "./Platform.js";

export class Map1 extends GameMap {
  load() {
    console.log("Loading Map 1");
    GAME_ENGINE.addEntity(new Player());
    GAME_ENGINE.addEntity(new Cactus(500, 380));
    GAME_ENGINE.addEntity(new Cactus(1000, 380));
    GAME_ENGINE.addEntity(new Cactus(-750, 380));
    GAME_ENGINE.addEntity(new Spider(800, 370));
    GAME_ENGINE.addEntity(new Background());
    GAME_ENGINE.addEntity(new Platform(0, 800, 100, 10));
    GAME_ENGINE.addEntity(new Platform(150, 400, 1, 6));
    GAME_ENGINE.addEntity(new Platform(-300, 20, 10, 1));
  }
}
