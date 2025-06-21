// ==UserScript==
// @name         Outlier Playground Sound Notification
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Toca um som quando a resposta do modelo termina de carregar
// @author       luascfl
// @match        https://app.outlier.ai/playground*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=outlier.ai
// @license      MIT
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // URL do som
    const SOUND_URL = "https://od.lk/s/MjJfMzM5NTM3ODNf/331673__nicola_ariutti__brass_bell_01_take10.wav";
    
    const audio = new Audio(SOUND_URL);
    let isLoading = false;
    let buttonObserver = null;

    function playSound() {
        audio.play().catch(e => console.error("Erro ao tocar o som:", e));
    }

    // Função para verificar o tipo de botão atual
    function getButtonType() {
        // Procura pelo botão de enviar (paper-plane)
        const sendButton = document.querySelector('button:has(svg[data-icon="paper-plane-top"])');
        // Procura pelo botão de parar (stop)
        const stopButton = document.querySelector('button:has(svg[data-icon="stop"])');
        
        if (stopButton) {
            return 'stop';
        } else if (sendButton) {
            return sendButton.disabled ? 'send-disabled' : 'send-enabled';
        }
        return 'none';
    }

    // Função principal de monitoramento
    function checkButtonState() {
        const currentState = getButtonType();
        
        console.log(`Estado do botão: ${currentState}`);
        
        // Se mudou para o botão de stop, significa que está carregando
        if (currentState === 'stop' && !isLoading) {
            isLoading = true;
            console.log("🔄 Iniciou o carregamento da resposta...");
        }
        
        // Se estava carregando e agora voltou para o botão de enviar habilitado
        if (isLoading && currentState === 'send-enabled') {
            isLoading = false;
            console.log("✅ Resposta completa! Tocando som...");
            playSound();
        }
    }

    // Observador para mudanças no container dos botões
    function setupButtonObserver() {
        // Primeiro, tenta encontrar o container pai dos botões
        // Pode ser necessário ajustar este seletor baseado na estrutura real
        const buttonContainer = document.querySelector('form, [class*="input"], [class*="chat-input"], [class*="message-form"]');
        
        if (!buttonContainer) {
            console.log("Container dos botões não encontrado, tentando novamente...");
            setTimeout(setupButtonObserver, 500);
            return;
        }
        
        console.log("🎯 Container dos botões encontrado! Iniciando observação...");
        
        // Desconecta observer anterior se existir
        if (buttonObserver) {
            buttonObserver.disconnect();
        }
        
        // Cria novo observer
        buttonObserver = new MutationObserver((mutations) => {
            // Verifica se houve mudanças relevantes
            let relevantChange = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    // Verifica se algum botão foi adicionado ou removido
                    const addedButtons = Array.from(mutation.addedNodes).some(node => 
                        node.nodeName === 'BUTTON' || (node.querySelector && node.querySelector('button'))
                    );
                    const removedButtons = Array.from(mutation.removedNodes).some(node => 
                        node.nodeName === 'BUTTON' || (node.querySelector && node.querySelector('button'))
                    );
                    
                    if (addedButtons || removedButtons) {
                        relevantChange = true;
                    }
                } else if (mutation.type === 'attributes' && mutation.target.nodeName === 'BUTTON') {
                    relevantChange = true;
                }
            });
            
            if (relevantChange) {
                checkButtonState();
            }
        });
        
        // Observa mudanças no container
        buttonObserver.observe(buttonContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['disabled']
        });
        
        // Verifica o estado inicial
        checkButtonState();
    }

    // Método alternativo mais simples: polling
    function setupPolling() {
        let lastState = getButtonType();
        
        setInterval(() => {
            const currentState = getButtonType();
            
            if (currentState !== lastState) {
                console.log(`Estado mudou de '${lastState}' para '${currentState}'`);
                
                // Se mudou de qualquer estado para 'stop', começou a carregar
                if (currentState === 'stop' && lastState !== 'stop') {
                    isLoading = true;
                    console.log("🔄 Iniciou o carregamento da resposta...");
                }
                
                // Se mudou de 'stop' para 'send-enabled', terminou de carregar
                if (lastState === 'stop' && currentState === 'send-enabled') {
                    isLoading = false;
                    console.log("✅ Resposta completa! Tocando som...");
                    playSound();
                }
                
                lastState = currentState;
            }
        }, 100); // Verifica a cada 100ms
    }

    // Função de debug
    function debugElements() {
        console.log("=== DEBUG INFO ===");
        
        const sendButton = document.querySelector('button:has(svg[data-icon="paper-plane-top"])');
        const stopButton = document.querySelector('button:has(svg[data-icon="stop"])');
        
        console.log("Botão de enviar encontrado:", sendButton);
        console.log("Botão de parar encontrado:", stopButton);
        console.log("Estado atual:", getButtonType());
        
        if (sendButton) {
            console.log("HTML do botão de enviar:", sendButton.outerHTML);
        }
        if (stopButton) {
            console.log("HTML do botão de parar:", stopButton.outerHTML);
        }
        
        console.log("=== FIM DEBUG ===");
    }

    // Inicia o script
    console.log("🚀 Iniciando Outlier Playground Sound Notification v4.0...");
    
    // Aguarda um pouco para a página carregar
    setTimeout(() => {
        // Usa ambos os métodos para maior confiabilidade
        setupButtonObserver();
        setupPolling(); // Método de fallback
        
        console.log("✅ Script iniciado com sucesso!");
        console.log("ℹ️ O som tocará quando a resposta do modelo terminar de carregar.");
    }, 1000);

    // Adiciona comandos de debug no console
    window.debugOutlierScript = debugElements;
    window.outlierScriptStatus = () => {
        console.log({
            isLoading,
            currentButtonType: getButtonType(),
            audioReady: audio.readyState === 4
        });
    };
    
    console.log("Comandos disponíveis:");
    console.log("- debugOutlierScript() - Mostra informações de debug");
    console.log("- outlierScriptStatus() - Mostra status atual do script");

})();
