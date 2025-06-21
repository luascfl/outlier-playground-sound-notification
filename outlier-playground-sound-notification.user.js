// ==UserScript==
// @name         Outlier Playground Sound Notification
// @namespace    http://tampermonkey.net/
// @version      4.7
// @description  Toca um som quando a geração de resposta termina, adiciona "Continue" na caixa de texto e clica em "Not now" quando detectado
// @author       luascfl (revisado por Gemini e Claude)
// @match        https://app.outlier.ai/playground*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=outlier.ai
// @license      MIT
// @homepageURL  https://github.com/luascfl/outlier-playground-sound-notification
// @supportURL   https://github.com/luascfl/outlier-playground-sound-notification/issues
// @updateURL    https://raw.githubusercontent.com/luascfl/outlier-playground-sound-notification/main/outlier-playground-sound-notification.user.js
// @downloadURL  https://raw.githubusercontent.com/luascfl/outlier-playground-sound-notification/main/outlier-playground-sound-notification.user.js
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // --- CONFIGURAÇÃO ---
    const SOUND_URL = "https://od.lk/s/MjJfMzM5NTM3ODNf/331673__nicola_ariutti__brass_bell_01_take10.wav";
    const POLLING_INTERVAL_MS = 200; // Intervalo de verificação em milissegundos. 200ms é um bom equilíbrio.
    const AUTO_CONTINUE_TEXT = "Continue"; // Texto a ser adicionado automaticamente
    const NOT_NOW_DELAY_MS = 4000; // Delay de 4 segundos antes de clicar em "Not now"

    // --- INICIALIZAÇÃO ---
    const audio = new Audio(SOUND_URL);
    let lastState = null;

    console.log("🚀 Iniciando Outlier Playground Sound Notification v4.7...");

    /**
     * Tenta tocar o som de notificação.
     * Inclui tratamento de erro para casos em que o navegador bloqueia o autoplay.
     */
    function playSound() {
        console.log("🔔 Tocando som de notificação...");
        audio.play().catch(e => console.error("Erro ao tocar o som. O navegador pode ter bloqueado a reprodução automática. Interaja com a página (clique em algo) e tente novamente.", e));
    }

    /**
     * Adiciona texto "Continue" na caixa de texto do prompt simulando interação real do usuário
     */
    function addContinueText() {
        const textArea = document.querySelector('textarea.ChatInput_textarea__QUOCH');
        
        if (textArea) {
            // Limpa e foca
            textArea.focus();
            textArea.select();
            document.execCommand('delete');
            
            // Método 1: Usa execCommand para inserir texto (funciona em muitos casos onde outros métodos falham)
            document.execCommand('insertText', false, AUTO_CONTINUE_TEXT);
            
            // Método 2: Simula eventos de teclado para cada caractere
            setTimeout(() => {
                if (textArea.value !== AUTO_CONTINUE_TEXT) {
                    textArea.value = '';
                    textArea.focus();
                    
                    // Simula pressionamento de tecla para cada caractere
                    for (let i = 0; i < AUTO_CONTINUE_TEXT.length; i++) {
                        const char = AUTO_CONTINUE_TEXT[i];
                        
                        // KeyDown
                        const keydownEvent = new KeyboardEvent('keydown', {
                            key: char,
                            code: 'Key' + char.toUpperCase(),
                            keyCode: char.charCodeAt(0),
                            which: char.charCodeAt(0),
                            bubbles: true,
                            cancelable: true
                        });
                        textArea.dispatchEvent(keydownEvent);
                        
                        // KeyPress (deprecated mas alguns sites ainda usam)
                        const keypressEvent = new KeyboardEvent('keypress', {
                            key: char,
                            code: 'Key' + char.toUpperCase(),
                            keyCode: char.charCodeAt(0),
                            which: char.charCodeAt(0),
                            bubbles: true,
                            cancelable: true
                        });
                        textArea.dispatchEvent(keypressEvent);
                        
                        // Adiciona o caractere
                        textArea.value += char;
                        
                        // Input event
                        const inputEvent = new InputEvent('input', {
                            data: char,
                            inputType: 'insertText',
                            bubbles: true,
                            cancelable: true
                        });
                        textArea.dispatchEvent(inputEvent);
                        
                        // KeyUp
                        const keyupEvent = new KeyboardEvent('keyup', {
                            key: char,
                            code: 'Key' + char.toUpperCase(),
                            keyCode: char.charCodeAt(0),
                            which: char.charCodeAt(0),
                            bubbles: true,
                            cancelable: true
                        });
                        textArea.dispatchEvent(keyupEvent);
                    }
                    
                    // Dispara evento de change final
                    textArea.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }, 100);
            
            // Método 3: Tenta forçar uma atualização do React se os métodos anteriores falharem
            setTimeout(() => {
                if (textArea.value === AUTO_CONTINUE_TEXT) {
                    console.log("✍️ Texto 'Continue' adicionado com sucesso!");
                    
                    // Simula um espaço e backspace para forçar reconhecimento
                    const spaceDown = new KeyboardEvent('keydown', {
                        key: ' ',
                        code: 'Space',
                        keyCode: 32,
                        which: 32,
                        bubbles: true
                    });
                    const spaceUp = new KeyboardEvent('keyup', {
                        key: ' ',
                        code: 'Space',
                        keyCode: 32,
                        which: 32,
                        bubbles: true
                    });
                    const backspaceDown = new KeyboardEvent('keydown', {
                        key: 'Backspace',
                        code: 'Backspace',
                        keyCode: 8,
                        which: 8,
                        bubbles: true
                    });
                    const backspaceUp = new KeyboardEvent('keyup', {
                        key: 'Backspace',
                        code: 'Backspace',
                        keyCode: 8,
                        which: 8,
                        bubbles: true
                    });
                    
                    // Adiciona e remove um espaço
                    textArea.dispatchEvent(spaceDown);
                    textArea.value += ' ';
                    textArea.dispatchEvent(new InputEvent('input', {
                        data: ' ',
                        inputType: 'insertText',
                        bubbles: true
                    }));
                    textArea.dispatchEvent(spaceUp);
                    
                    setTimeout(() => {
                        textArea.dispatchEvent(backspaceDown);
                        textArea.value = textArea.value.slice(0, -1);
                        textArea.dispatchEvent(new InputEvent('input', {
                            inputType: 'deleteContentBackward',
                            bubbles: true
                        }));
                        textArea.dispatchEvent(backspaceUp);
                    }, 50);
                }
            }, 500);
            
        } else {
            console.warn("⚠️ Caixa de texto não encontrada");
        }
    }

    /**
     * Clica no botão "Not now" quando detectado
     */
    function clickNotNowButton() {
        // Procura por todos os botões com as classes especificadas
        const buttons = document.querySelectorAll('button[data-accent-color="gray"].rt-Button');
        
        let notNowButton = null;
        
        // Verifica cada botão para encontrar o que contém "Not now"
        for (const button of buttons) {
            if (button.textContent && button.textContent.trim() === 'Not now') {
                notNowButton = button;
                break;
            }
        }
        
        if (notNowButton) {
            console.log(`⏳ Aguardando ${NOT_NOW_DELAY_MS/1000} segundos antes de clicar em 'Not now'...`);
            
            setTimeout(() => {
                // Verifica se o botão ainda existe antes de clicar
                if (document.body.contains(notNowButton)) {
                    notNowButton.click();
                    console.log("🖱️ Botão 'Not now' clicado automaticamente");
                } else {
                    console.log("⚠️ Botão 'Not now' não está mais disponível");
                }
            }, NOT_NOW_DELAY_MS);
        } else {
            console.log("ℹ️ Botão 'Not now' não encontrado neste momento");
        }
    }

    /**
     * Verifica qual tipo de botão está visível na interface.
     * @returns {'stop' | 'send-enabled' | 'send-disabled' | 'none'} O estado atual do botão.
     */
    function getButtonType() {
        // Procura pelo botão de parar (stop)
        const stopButton = document.querySelector('button:has(svg[data-icon="stop"])');
        if (stopButton) {
            return 'stop';
        }

        // Procura pelo botão de enviar (paper-plane)
        const sendButton = document.querySelector('button:has(svg[data-icon="paper-plane-top"])');
        if (sendButton) {
            // Verifica se o botão de enviar está desabilitado
            return sendButton.disabled ? 'send-disabled' : 'send-enabled';
        }

        return 'none';
    }

    /**
     * Função principal que monitora a mudança de estado e decide quando tocar o som.
     */
    function monitorStateChange() {
        const currentState = getButtonType();

        // Se o estado não foi inicializado ainda, apenas define o estado inicial.
        if (lastState === null) {
            lastState = currentState;
            return;
        }

        // Se o estado mudou, processa a lógica.
        if (currentState !== lastState) {
            console.log(`Mudança de estado detectada: de '${lastState}' para '${currentState}'`);

            // CONDIÇÕES PARA CLICAR EM "NOT NOW":
            // 1. Se o estado anterior era 'none' e o novo estado é 'send-disabled'
            // 2. Se o estado anterior era 'send-enabled' e o novo estado é 'none'
            if ((lastState === 'none' && currentState === 'send-disabled') || 
                (lastState === 'send-enabled' && currentState === 'none')) {
                console.log("🔍 Detectada transição que pode ter 'Not now', procurando botão...");
                // Chama a função imediatamente, ela cuida do delay internamente
                clickNotNowButton();
            }

            // CONDIÇÃO ORIGINAL:
            // Se o estado anterior era 'stop' e o novo estado é qualquer tipo de 'send',
            // significa que a geração da resposta acabou de terminar.
            if (lastState === 'stop' && currentState.startsWith('send')) {
                console.log("✅ Resposta completa!");
                playSound();
                
                // Adiciona um delay maior para garantir que a interface esteja pronta
                setTimeout(() => {
                    addContinueText();
                }, 300);
            }

            // Atualiza o último estado conhecido.
            lastState = currentState;
        }
    }

    // Aguarda um momento para garantir que a interface do site foi carregada
    // antes de iniciar o monitoramento.
    setTimeout(() => {
        // Inicializa o estado pela primeira vez.
        lastState = getButtonType();
        console.log(`Estado inicial do botão: '${lastState}'`);

        // Inicia o monitoramento contínuo (polling).
        setInterval(monitorStateChange, POLLING_INTERVAL_MS);

        console.log("✅ Script iniciado com sucesso! Monitorando o botão de resposta.");
        console.log("ℹ️ O som tocará e 'Continue' será adicionado quando a resposta do modelo terminar de ser gerada.");
        console.log("ℹ️ O botão 'Not now' será clicado automaticamente após 4 segundos quando detectado nas transições específicas.");
    }, 1500);

    // --- FUNÇÕES DE DEBUG (Opcional) ---
    function debugElements() {
        console.log("=== INFORMAÇÕES DE DEBUG ===");
        const sendButton = document.querySelector('button:has(svg[data-icon="paper-plane-top"])');
        const stopButton = document.querySelector('button:has(svg[data-icon="stop"])');
        const textArea = document.querySelector('textarea.ChatInput_textarea__QUOCH');
        const buttons = document.querySelectorAll('button[data-accent-color="gray"].rt-Button');
        
        console.log("Botão de Enviar (Send) encontrado:", sendButton);
        if (sendButton) {
            console.log("HTML do Botão de Enviar:", sendButton.outerHTML);
            console.log("Botão Send está desabilitado?", sendButton.disabled);
        }
        console.log("Botão de Parar (Stop) encontrado:", stopButton);
        if (stopButton) console.log("HTML do Botão de Parar:", stopButton.outerHTML);
        console.log("Caixa de texto encontrada:", textArea);
        if (textArea) {
            console.log("HTML da Caixa de texto:", textArea.outerHTML);
            console.log("Valor atual da textarea:", textArea.value);
        }
        
        console.log("Botões cinzas encontrados:", buttons.length);
        buttons.forEach((button, index) => {
            console.log(`Botão cinza ${index + 1}:`, button.textContent.trim(), button.outerHTML);
        });
        
        console.log("Estado atual (getButtonType):", getButtonType());
        console.log("Último estado registrado (lastState):", lastState);
        console.log("=== FIM
Claude Opus 4
Continue


JAVASCRIPT

        console.log("=== FIM DO DEBUG ===");
    }

    // Adiciona o comando de debug à janela para que possa ser chamado pelo console.
    window.debugOutlierScript = debugElements;
    console.log("💡 Dica: Digite 'debugOutlierScript()' no console para verificar o estado dos elementos.");

})();
