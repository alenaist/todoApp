import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const DebugAnimatedAvatar = ({ message, isLoadingApiCall }) => {
    const spriteUrl = '/bitmap.png';
    const gameRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        class MessageScene extends Phaser.Scene {
            constructor() {
                super('MessageScene');
                this.messageText = null;
                this.sprite = null;
            }

            preload() {
                console.log('No spritesheet to load, using a circle instead.');
            }

            create() {
                const centerX = this.cameras.main.width / 2;
                const groundY = this.cameras.main.height - 50;

                this.field = this.add.graphics({ fillStyle: { color: 0x006400 } });
                this.field.fillRect(0, groundY, this.cameras.main.width, 50);

                // Crear estrellas separadas
                const starPositions = Array.from({ length: 30 }, () => ({
                    x: Phaser.Math.Between(0, this.cameras.main.width),
                    y: Phaser.Math.Between(0, groundY - 100)
                }));

                starPositions.map(pos => {
                    const star = this.add.graphics({ fillStyle: { color: 0xffffff } });
                    star.fillCircle(pos.x, pos.y, 2); // Estrella pequeña
                });

                // Dibujar una montaña más natural usando un camino
                const mountain = this.add.graphics({ fillStyle: { color: 0x654321 } }); // Color marrón
                mountain.beginPath();
                mountain.moveTo(centerX - 200, groundY);
                mountain.lineTo(centerX - 100, groundY - 80);
                mountain.lineTo(centerX, groundY - 150);
                mountain.lineTo(centerX + 100, groundY - 80);
                mountain.lineTo(centerX + 200, groundY);
                mountain.closePath();
                mountain.fillPath();

                // Añadir nieve en la cima
                const snow = this.add.graphics({ fillStyle: { color: 0xffffff } });
                snow.beginPath();
                snow.moveTo(centerX - 40, groundY - 120);
                snow.lineTo(centerX - 30, groundY - 130);
                snow.lineTo(centerX, groundY - 150);
                snow.lineTo(centerX + 90, groundY - 89);
                snow.lineTo(centerX + 30, groundY - 100);
                snow.closePath();
                snow.fillPath();

                this.clouds = [];
                for (let i = 0; i < 3; i++) {
                    const cloud = this.add.graphics({ fillStyle: { color: 0xA3BFFA } });
                    cloud.fillCircle(0, 0, 20);
                    cloud.fillCircle(20, 0, 20);
                    cloud.fillCircle(10, -10, 20);
                    cloud.x = Phaser.Math.Between(0, this.cameras.main.width);
                    cloud.y = Phaser.Math.Between(20, 100);
                    this.clouds.push(cloud);

                    this.tweens.add({
                        targets: cloud,
                        x: this.cameras.main.width + 40,
                        duration: 10000,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut',
                        onRepeat: () => {
                            cloud.x = -40;
                        }
                    });
                }

                this.monsterContainer = this.add.container(centerX, groundY);

                this.circle = this.add.graphics({ fillStyle: { color: 0x000000 } });
                this.circle.fillCircle(0, 0, 32);

                this.leftEye = this.add.graphics({ fillStyle: { color: 0xffffff } });
                this.rightEye = this.add.graphics({ fillStyle: { color: 0xffffff } });
                this.drawEyes(0, 0);

                this.leftIris = this.add.graphics({ fillStyle: { color: 0x000000 } });
                this.rightIris = this.add.graphics({ fillStyle: { color: 0x000000 } });
                this.drawIris(0, 0);

                this.mouth = this.add.graphics({ fillStyle: { color: 0xffffff } });
                this.drawMouth(0, 0);

                this.speechBubble = this.add.graphics().setVisible(false);
                this.messageText = this.add.text(
                    0, 
                    -100, 
                    '', 
                    { 
                        color: '#000', 
                        fontSize: '12px',
                        wordWrap: { width: 140 }
                    }
                ).setOrigin(0.5).setVisible(false);

                this.monsterContainer.add([this.circle, this.leftEye, this.rightEye, this.leftIris, this.rightIris, this.mouth, this.speechBubble, this.messageText]);

                // Animación de caminar para el círculo
                this.tweens.add({
                    targets: this.circle,
                    scaleX: 1.05, // Ensanchar ligeramente
                    scaleY: 0.95, // Encoger ligeramente
                    duration: 500,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });

                this.input.on('pointerdown', () => {
                    this.messageText.setVisible(false);
                    this.speechBubble.setVisible(false);
                    if (this.mouthTween) {
                        this.mouthTween.stop();
                    }
                });

                this.time.addEvent({
                    delay: 2000,
                    callback: this.moveOnGround,
                    callbackScope: this,
                    loop: true
                });

                this.time.addEvent({
                    delay: 4000,
                    callback: this.blinkEyes,
                    callbackScope: this,
                    loop: true
                });

                this.time.addEvent({
                    delay: 6000,
                    callback: this.jump,
                    callbackScope: this,
                    loop: true
                });

                this.time.addEvent({
                    delay: 10000,
                    callback: this.lookAround,
                    callbackScope: this,
                    loop: true
                });
            }

            drawEyes(x, y) {
                this.leftEye.clear();
                this.rightEye.clear();
                this.leftEye.fillCircle(x - 15, y - 10, 15);
                this.rightEye.fillCircle(x + 15, y - 10, 15);
            }

            drawIris(x, y) {
                this.leftIris.clear();
                this.rightIris.clear();
                this.leftIris.fillCircle(x - 10, y - 10, 6);
                this.rightIris.fillCircle(x + 10, y - 10, 6);
            }

            drawMouth(x, y) {
                this.mouth.clear();
                this.mouth.fillStyle(0xffffff, 1);
                this.mouth.fillRect(x - 10, y + 10, 20, 5);
            }

            drawSpeechBubble(x, y, width, height) {
                const bubbleWidth = width;
                const bubbleHeight = height;
                const arrowHeight = 10;

                this.speechBubble.clear();
                this.speechBubble.lineStyle(1, 0x000000, 1);
                this.speechBubble.fillStyle(0xffffff, 1);

                this.speechBubble.fillRoundedRect(x - bubbleWidth / 2, y - bubbleHeight - arrowHeight, bubbleWidth, bubbleHeight, 10);

                this.speechBubble.fillTriangle(
                    x - 10, y - arrowHeight,
                    x + 10, y - arrowHeight,
                    x, y
                );
            }

            animateMouth() {
                this.mouth.clear();
                this.mouth.fillStyle(0xffffff, 1);
                this.mouth.fillRect(-10, 10, 20, 5);

                this.mouthTween = this.tweens.add({
                    targets: this.mouth,
                    scaleX: 1.5,
                    duration: 200,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }

            moveOnGround() {
                const newX = Phaser.Math.Between(32, this.cameras.main.width - 32);

                this.tweens.add({
                    targets: this.monsterContainer,
                    x: newX,
                    duration: 3000,
                });
            }

            jump() {
                if (Math.random() < 0.3) {
                    this.tweens.add({
                        targets: this.monsterContainer,
                        y: this.monsterContainer.y - 50,
                        scaleX: 0.9, // Alargar ligeramente
                        scaleY: 1.1, // Alargar ligeramente
                        duration: 300,
                        ease: 'Cubic.easeOut',
                        yoyo: true,
                        onYoyo: () => {
                            // Aplastar al aterrizar
                            this.tweens.add({
                                targets: this.monsterContainer,
                                scaleX: 1.1, // Ensanchar
                                scaleY: 0.9, // Aplastar
                                duration: 100,
                                yoyo: true,
                                ease: 'Cubic.easeIn'
                            });
                        }
                    });
                }
            }

            blinkEyes() {
                this.leftEye.clear();
                this.rightEye.clear();
                this.leftIris.clear();
                this.rightIris.clear();
                this.time.delayedCall(200, () => {
                    this.drawEyes(0, 0);
                    this.drawIris(0, 0);
                });
            }

            lookAround() {
                const irisMovement = 5; // Distancia de movimiento de los iris

                this.tweens.add({
                    targets: [this.leftIris, this.rightIris],
                    x: `+=${Phaser.Math.Between(-irisMovement, irisMovement)}`,
                    y: `+=${Phaser.Math.Between(-irisMovement, irisMovement)}`,
                    duration: 1000,
                    yoyo: true,
                    ease: 'Sine.easeInOut'
                });
            }

            updateMessage(newMessage) {
                if (this.messageText) {
                    this.messageText.setText(newMessage);
                    this.messageText.setVisible(true);

                    const textWidth = this.messageText.width;
                    const textHeight = this.messageText.height;
                    this.drawSpeechBubble(0, -60, textWidth + 20, textHeight + 20);

                    this.messageText.setPosition(0, -90 - textHeight / 2 + 10);

                    this.speechBubble.setVisible(true);
                    this.animateMouth();

                    // Ocultar el mensaje después de 1 minuto
                    this.time.delayedCall(60000, () => {
                        this.messageText.setVisible(false);
                        this.speechBubble.setVisible(false);
                        if (this.mouthTween) {
                            this.mouthTween.stop();
                        }
                    });
                }
            }

            showThinking() {
                this.messageText.setText("Pensando en tu tarea...");
                this.messageText.setVisible(true);
                this.drawSpeechBubble(0, -80, 150, 50);
                this.messageText.setPosition(0, -95 - 20);
                this.speechBubble.setVisible(true);
            }

            hideThinking() {
                this.messageText.setVisible(false);
                this.speechBubble.setVisible(false);
            }
        }

        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = 300;

        const config = {
            type: Phaser.AUTO,
            parent: containerRef.current,
            width: containerWidth,
            height: containerHeight,
            transparent: false,
            backgroundColor: '#1E3A8A',
            scene: MessageScene,
            scale: {
                mode: Phaser.Scale.NONE,
                width: containerWidth,
                height: containerHeight,
            },
            render: {
                pixelArt: false,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
            }
        };

        const game = new Phaser.Game(config);
        gameRef.current = game;

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
            }
        };
    }, [spriteUrl]);

    useEffect(() => {
        if (gameRef.current) {
            const scene = gameRef.current.scene.getScene('MessageScene');
            if (scene) {
                if (isLoadingApiCall) {
                    scene.showThinking();
                } else {
                    scene.hideThinking();
                    if (typeof scene.updateMessage === 'function') {
                        scene.updateMessage(message);
                    }
                }
            }
        }
    }, [message, isLoadingApiCall]);

    return (
        <div className="relative w-full" style={{ aspectRatio: '1/1' }}>
            <div 
                ref={containerRef}
                className="absolute inset-0 bg-transparent"
                style={{
                    width: '100%',
                    height: '100%',
                }}
            />
        </div>
    );
};

export default DebugAnimatedAvatar;