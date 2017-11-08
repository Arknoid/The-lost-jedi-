// Variable pour afficher les HitsBox

BasicGame.Game = function(game) {

  //DÉCLARATION DES VARIABLES GLOBALS
  this.global = {
    score : 0,
    debug : false, // Pour afficher les hitboxs
  }

  // When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:
  this.game; //  a reference to the currently running game (Phaser.Game)
  this.add; //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
  this.camera; //  a reference to the game camera (Phaser.Camera)
  this.cache; //  the game cache (Phaser.Cache)
  this.input; //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
  this.load; //  for preloading assets (Phaser.Loader)
  this.math; //  lots of useful common math operations (Phaser.Math)
  this.sound; //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
  this.stage; //  the game stage (Phaser.Stage)
  this.time; //  the clock (Phaser.Time)
  this.tweens; //  the tween manager (Phaser.TweenManager)
  this.state; //  the state manager (Phaser.StateManager)
  this.world; //  the game world (Phaser.World)
  this.particles; //  the particle manager (Phaser.Particles)
  this.physics; //  the physics manager (Phaser.Physics)
  this.rnd; //  the repeatable random number generator (Phaser.RandomDataGenerator)

  //  You can use any of these from any function within this State.
  //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};
BasicGame.Game.prototype = {

  //Déclaration des Constantes
  SPEEDPLAYER : 60,
  SHOTDELAY : 100,
  SHOTSPEED : 200,



  preload: function() {

    // GAME ASSETS (en attente de déplacer sur le boot.js)

    // Graphics
    this.load.image('gLaser', 'Assets/gLaser.png');
    this.load.image('xWing', 'Assets/xWing.png');
    this.load.image('rLaser', 'Assets/rLaser.png');
    this.load.spritesheet('tie', 'Assets/tie-Sheet.png', 8, 8);
    this.load.spritesheet('explosion', 'Assets/explosion-Sheet.png', 8, 8);
    this.load.image('star', 'assets/starLong.png');
    this.load.image('star2', 'assets/starLong2.png');
    this.load.image('planete', 'assets/planeteTest.png');

    // Audio


  },
  create: function() {

    //Mise en forme de la resolution responsive
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.setMinMax(480, 260, 1024, 768);
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;

    //Appel pour le FullScreen
    //this.game.input.onDown.add(this.goFullScreen, this);

    // premet d'enlever l'effets de flou
    this.game.renderer.renderSession.roundPixels = true;
    Phaser.Canvas.setImageRenderingCrisp(this.game.canvas)

    this.setupBackground(); //Initialize Background (A completter)
    this.setupPlayer();     //Initialize Player
    this.setupGUI();        //Initialize GUI        (A completter)
    this.setupEnemies();    //Initialize Enemies
    this.setupShot();       //Initialize Player Shot
    this.setupExplosions(); //Initialize Explosion effets
    this.setupText();       //Initialize Text Screen
  },

  //Mise a jour 60 fois par secondes
  update: function() {
    this.checkCollisions();
    this.spawnEnemies();
    this.processPlayerInput();
    //this.processDelayEffets(); //Désactiver car la police actuelle n'est pas compatible avec la resolution
  },


  fire: function() {
    //Gestion du delay
    if (!this.player.alive || this.nextShotAt > this.time.now) {
      return;
    }
    //pas de tir si le jouer n'es plus en vie
    if (this.playerShotPool.countDead() === 0) {
      return;
    }
    this.nextShotAt = this.time.now + this.shotDelay;
    // Find the first dead laser in the pool
    var laserPlayer = this.playerShotPool.getFirstExists(false);
    // Reset (revive) the sprite and place it in a new location
    laserPlayer.reset(this.player.x, this.player.y - 2);
    laserPlayer.body.velocity.y = -this.shotSpeed;
  },
  enemyHit: function(shot, enemy) {
    this.damageEnemy(enemy, 1);
    shot.kill();
  },
  playerHit: function(player, enemy) {
    this.damageEnemy(enemy, 5);
    player.kill();
  },
  damageEnemy: function(enemy, damage) {
    enemy.damage(damage);
    if (enemy.alive) {
      enemy.play('hit');
    } else {
      this.explode(enemy);
    }
  },
  explode: function(sprite) {
    if (this.explosionPool.countDead() === 0) {
      return;
    }
    var explosion = this.explosionPool.getFirstExists(false);
    explosion.reset(sprite.x, sprite.y);
    explosion.play('start', 10, false, true);
    // add the original sprite's velocity to the explosion
    explosion.body.velocity.x = sprite.body.velocity.x;
    explosion.body.velocity.y = sprite.body.velocity.y;

  },
  render: function() {
    //Debug Collision
    if (this.global.debug) {
      this.game.debug.body(this.player);
    }
  },

  setupBackground : function(){
      
    this.emitter = this.game.add.emitter(this.game.world.centerX, 0, 400);

    this.emitter.width = this.game.world.width;
        // emitter.angle = 30;

    this.emitter.makeParticles('star');

    this.emitter.minParticleScale = 0.5;
    this.emitter.maxParticleScale = 1;

    this.emitter.setYSpeed(10, 20);
    this.emitter.setXSpeed(0, 0);

    this.emitter.minRotation = 0;
    this.emitter.maxRotation = 0;

    this.emitter.start(false, 2000, 5, 0);
    
    //vitesse de déplacement des étoiles modèle 2
//    var setYSpeedA = 75;
//    var setYSpeedB = 150;
        
//    this.emitter2 = this.game.add.emitter(this.game.world.centerX, 0, 400);
//
//    this.emitter2.width = this.game.world.width;
//        // emitter.angle = 30; // uncomment to set an angle for the rain.
//
//    this.emitter2.makeParticles('star2');
//
//    this.emitter2.minParticleScale = 0.7;
//    this.emitter2.maxParticleScale = 1;
//
//    this.emitter2.setYSpeed(15, 30);
//    this.emitter2.setXSpeed(0, 0);
//
//    this.emitter2.minRotation = 0;
//    this.emitter2.maxRotation = 0;
//
//    this.emitter2.start(false, 2000, 5, 0);

  },
  setupGUI :function(){


  },
  setupPlayer: function() {

    this.cursors = this.input.keyboard.createCursorKeys(); //Controle de base au clavier
    this.player = this.add.sprite(this.game.world.centerX,this.game.world.height-15, 'xWing'); //add sprite
    this.player.speed = this.SPEEDPLAYER;
    this.player.anchor.setTo(0.5, 0.5); //centre le point d'origine
    this.physics.enable(this.player, Phaser.Physics.ARCADE); //physique arcade
    this.player.body.collideWorldBounds = true; //permet de limiter la zone de jeu
    this.player.body.setSize(4, 4, 2, 2); // reduction de la hitbox

  },
  setupEnemies: function() {
    //Enemy variables
    this.nextEnemyAt = 0;
    this.enemyDelay = 100;
    //Group ennemyPool
    this.enemyPool = this.add.group();
    this.enemyPool.enableBody = true;
    this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.enemyPool.createMultiple(50, 'tie');
    this.enemyPool.setAll('anchor.x', 0.5);
    this.enemyPool.setAll('anchor.y', 0.5);
    this.enemyPool.setAll('outOfBoundsKill', true);
    this.enemyPool.setAll('checkWorldBounds', true);
    // Set the animation for each sprite
    this.enemyPool.forEach(function(enemy) {
      enemy.animations.add('idle', [0, 1, 2, 3], 20, true);
      enemy.animations.add('hit', [4, 4, 4, 4], 20, false); //quand c'est finie retour sur idle
      enemy.events.onAnimationComplete.add(function(e) {
        e.play('idle');
      }, this);
    });
  },
  setupShot: function() {
    //Shot variables
    this.nextShotAt = 0;
    this.shotDelay = this.SHOTDELAY;
    this.shotSpeed = this.SHOTSPEED;

    //Group playerShotPool
    // Add an empty sprite group into our game
    this.playerShotPool = this.add.group();
    // Enable physics to the whole sprite group
    this.playerShotPool.enableBody = true;
    this.playerShotPool.physicsBodyType = Phaser.Physics.ARCADE;
    // Add 100 'bullet' sprites in the group.
    // By default this uses the first frame of the sprite sheet and
    //sets the initial state as non - existing(i.e.killed / dead)
    this.playerShotPool.createMultiple(100, 'gLaser');
    // Sets anchors of all sprites
    this.playerShotPool.setAll('anchor.x', 0.5);
    this.playerShotPool.setAll('anchor.y', 0.5);
    // Automatically kill the bullet sprites when they go out of b
    this.playerShotPool.setAll('outOfBoundsKill', true);
    this.playerShotPool.setAll('checkWorldBounds', true);
  },
  setupExplosions: function() {
    //Group explosionPool
    this.explosionPool = this.add.group();
    this.explosionPool.enableBody = true;
    this.explosionPool.physicsBodyType = Phaser.Physics.ARCADE;
    this.explosionPool.createMultiple(100, 'explosion');
    this.explosionPool.setAll('anchor.x', 0.5);
    this.explosionPool.setAll('anchor.y', 0.5);
    this.explosionPool.forEach(function(explosion) {
    explosion.animations.add('start');

    });
  },
  setupText: function() { //FONCTION DESACTIVER CAR LA  FONT N'EST PAS COMPATIBLE AVEC LA RESOLTUION
    //Duré affichae des instructions
    //this.instructionsDelay = 4; //Secondes
    //Affichage des commandes
    /*this.instructions = this.add.text(50, 70,
      'Use Arrow Keys to Move, Press SPACE to Fire', {
        font: '10px monospace',
        fill: '#fff',
        align: 'center'
      }

    );
    this.instructions.anchor.setTo(0.5, 0.5);
    this.instExpire = this.time.now + this.instructionsDelay * 600;
    */
  },
  checkCollisions: function() {
    //Gestions des collisions
    this.physics.arcade.overlap(
      this.playerShotPool, this.enemyPool, this.enemyHit, null, this
    );
    this.physics.arcade.overlap(
      this.player, this.enemyPool, this.playerHit, null, this
    );
  },
  spawnEnemies: function() {

    if (this.nextEnemyAt < this.time.now && this.enemyPool.countDead() > 0) {
      this.nextEnemyAt = this.time.now + this.enemyDelay;
      var enemy = this.enemyPool.getFirstExists(false);
      // spawn at a random location top of the screen
      enemy.reset(this.rnd.integerInRange(10, 182), 0, this.enemyInitialHealth);
      // also randomize the speed
      enemy.body.velocity.y = this.rnd.integerInRange(20, 80);
      enemy.play('idle')
      enemy.health = 4;
    }
  },
  processPlayerInput: function() {
    //Initialise no movments
    this.player.body.velocity.x = 0;
    this.player.body.velocity.y = 0;

    //Mouvement Left Right
    if (this.cursors.left.isDown) {
      this.player.body.velocity.x = -this.player.speed;
    } else if (this.cursors.right.isDown) {
      this.player.body.velocity.x = this.player.speed;
    }
    //Mouvement Up Down
    if (this.cursors.up.isDown) {
      this.player.body.velocity.y = -this.player.speed;
    } else if (this.cursors.down.isDown) {
      this.player.body.velocity.y = this.player.speed;
    }

    //Call function Fire on press Space
    if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
      this.fire();
    }
  },
  processDelayEffets: function() {
    //Clean text info
    if (this.instructions.exists && this.time.now > this.instExpire) {
      this.instructions.destroy();
    }
  },
  goFullScreen: function() {
    this.game.scale.startFullScreen(true);
  },
  quitGame: function(pointer) {

    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
    //this.state.start('MainMenu');
  },
};
