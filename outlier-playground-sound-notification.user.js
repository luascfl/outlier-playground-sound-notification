// ==UserScript==
// @name         Outlier Playground Sound Notification
// @namespace    http://tampermonkey.net/
// @version      3.0
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
    let isWaitingForResponse = false;
    let lastMessageCount = 0;

    function playSound() {
        audio.play().catch(e => console.error("Erro ao tocar o som:", e));
    }

    // Função para contar mensagens na conversa
    function countMessages() {
        // Ajuste este seletor baseado na estrutura real da página
        return document.querySelectorAll('[class*="message"], [class*="chat-message"], [role="article"]').length;
    }

    // Função para verificar se o botão está desabilitado
    function isButtonDisabled() {
        const button = document.querySelector('button:has(svg[data-icon="paper-plane-top"])');
        return button && (button.disabled || button.getAttribute('disabled') !== null);
    }

    // Função principal de monitoramento
    function monitorChat() {
        const currentMessageCount = countMessages();
        const buttonDisabled = isButtonDisabled();
        
        // Detecta quando o usuário envia uma mensagem (botão fica desabilitado)
        if (buttonDisabled && !isWaitingForResponse) {
            isWaitingForResponse = true;
            lastMessageCount = currentMessageCount;
            console.log("Mensagem enviada, aguardando resposta...");
        }
        
        // Detecta quando uma nova mensagem aparece e o botão é reabilitado
        if (isWaitingForResponse && !buttonDisabled && currentMessageCount > lastMessageCount) {
            console.log("Nova mensagem recebida! Tocando som...");
            playSound();
            isWaitingForResponse = false;
        }
    }

    // Observador para mudanças no DOM
    function setupObserver() {
        const targetNode = document.body;
        
        const observer = new MutationObserver(() => {
            monitorChat();
        });
        
        observer.observe(targetNode, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['disabled', 'class']
        });
        
        console.log("Observador iniciado!");
    }

    // Método alternativo: observar especificamente o botão
    function observeButton() {
        const button = document.querySelector('button:has(svg[data-icon="paper-plane-top"])');
        
        if (!button) {
            setTimeout(observeButton, 500);
            return;
        }
        
        let wasDisabled = button.disabled;
        
        const observer = new MutationObserver(() => {
            const isDisabled = button.disabled;
            
            // Se o botão estava desabilitado e agora está habilitado
            if (wasDisabled && !isDisabled) {
                console.log("Botão reabilitado - resposta completa!");
                // Pequeno delay para garantir que a mensagem foi renderizada
                setTimeout(playSound, 100);
            }
            
            wasDisabled = isDisabled;
        });
        
        observer.observe(button, {
            attributes: true,
            attributeFilter: ['disabled']
        });
        
        // Também observa mudanças no conteúdo do chat
        const chatContainer = document.querySelector('main, [role="main"], .chat-container');
        if (chatContainer) {
            const chatObserver = new MutationObserver(() => {
                monitorChat();
            });
            
            chatObserver.observe(chatContainer, {
                childList: true,
                subtree: true
            });
        }
    }

    // Função de debug para ajudar a identificar elementos
    function debugElements() {
        console.log("=== DEBUG INFO ===");
        
        const button = document.querySelector('button:has(svg[data-icon="paper-plane-top"])');
        console.log("Botão encontrado:", button);
        console.log("Botão desabilitado:", button?.disabled);
        console.log("Classes do botão:", button?.className);
        
        // Procura por indicadores de carregamento
        const spinners = document.querySelectorAll('[class*="spin"], [class*="load"], [class*="animate"]');
        console.log("Elementos com animação encontrados:", spinners.length);
        spinners.forEach(el => console.log("- ", el.className));
        
        console.log("=== FIM DEBUG ===");
    }

    // Inicia o script
    setTimeout(() => {
        debugElements(); // Remove esta linha após identificar os elementos
        observeButton();
        setupObserver();
    }, 1000);

    // Adiciona comando de debug no console
    window.debugOutlierScript = debugElements;
    console.log("Script carregado! Use 'debugOutlierScript()' no console para debug.");

})();
