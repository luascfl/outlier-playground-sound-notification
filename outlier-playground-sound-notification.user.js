// ==UserScript==
// @name         Outlier Playground Sound Notification
// @namespace    http://tampermonkey.net/
// @version      4.1
// @description  Toca um som quando a geração de resposta termina (o botão 'Stop' é substituído pelo 'Send').
// @author       luascfl (revisado por Gemini)
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

    // --- INICIALIZAÇÃO ---
    const audio = new Audio(SOUND_URL);
    let lastState = null;

    console.log("🚀 Iniciando Outlier Playground Sound Notification v4.1...");

    /**
     * Tenta tocar o som de notificação.
     * Inclui tratamento de erro para casos em que o navegador bloqueia o autoplay.
     */
    function playSound() {
        console.log("🔔 Tocando som de notificação...");
        audio.play().catch(e => console.error("Erro ao tocar o som. O navegador pode ter bloqueado a reprodução automática. Interaja com a página (clique em algo) e tente novamente.", e));
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

            // A CONDIÇÃO CHAVE:
            // Se o estado anterior era 'stop' e o novo estado é qualquer tipo de 'send',
            // significa que a geração da resposta acabou de terminar.
            if (lastState === 'stop' && currentState.startsWith('send')) {
                console.log("✅ Resposta completa!");
                playSound();
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
        console.log("ℹ️ O som tocará quando a resposta do modelo terminar de ser gerada.");
    }, 1500); // Aumentei um pouco o tempo para garantir que a página esteja pronta.

    // --- FUNÇÕES DE DEBUG (Opcional) ---
    function debugElements() {
        console.log("=== INFORMAÇÕES DE DEBUG ===");
        const sendButton = document.querySelector('button:has(svg[data-icon="paper-plane-top"])');
        const stopButton = document.querySelector('button:has(svg[data-icon="stop"])');
        console.log("Botão de Enviar (Send) encontrado:", sendButton);
        if (sendButton) console.log("HTML do Botão de Enviar:", sendButton.outerHTML);
        console.log("Botão de Parar (Stop) encontrado:", stopButton);
        if (stopButton) console.log("HTML do Botão de Parar:", stopButton.outerHTML);
        console.log("Estado atual (getButtonType):", getButtonType());
        console.log("Último estado registrado (lastState):", lastState);
        console.log("=== FIM DO DEBUG ===");
    }

    // Adiciona o comando de debug à janela para que possa ser chamado pelo console.
    window.debugOutlierScript = debugElements;
    console.log("💡 Dica: Digite 'debugOutlierScript()' no console para verificar o estado dos elementos.");

})();
