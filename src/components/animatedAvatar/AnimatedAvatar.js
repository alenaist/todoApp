import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const AnimatedAvatar = ({ message }) => {
    const gameRef = useRef(null);

    useEffect(() => {
        class MessageScene extends Phaser.Scene {
            constructor() {
                super('MessageScene');
                this.messageText = null;
            }

            create() {
                const centerX = this.cameras.main.width / 2;
                const centerY = this.cameras.main.height / 2;

                // Create text object
                this.messageText = this.add.text(
                    centerX, 
                    centerY, 
                    message || '', 
                    { 
                        color: '#000', 
                        fontSize: '16px',
                        align: 'center',
                        wordWrap: { width: 250 }
                    }
                ).setOrigin(0.5);
            }

            // Method to update message
            updateMessage(newMessage) {
                if (this.messageText) {
                    this.messageText.setText(newMessage);
                }
            }
        }

        const config = {
            type: Phaser.WEBGL,
            parent: 'phaser-container',
            width: 300,
            height: 300,
            transparent: true,
            scene: MessageScene
        };

        const game = new Phaser.Game(config);
        gameRef.current = game;

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
            }
        };
    }, []);

    // Update Phaser scene when message changes
    useEffect(() => {
        if (gameRef.current) {
            const scene = gameRef.current.scene.getScene('MessageScene');
            if (scene && typeof scene.updateMessage === 'function') {
                scene.updateMessage(message);
            }
        }
    }, [message]);

    return (
        <div 
            id="phaser-container" 
            className="w-full h-full min-h-[300px]" 
            style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
            }} 
        />
    );
};

export default AnimatedAvatar;