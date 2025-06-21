// ==UserScript==
// @name         Outlier Playground Sound Notification
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  Toca um som quando a animação de carregamento do botão 'Send' termina.
// @author       luascfl
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

    // URL do som a ser tocado
    const SOUND_URL = "https://od.lk/s/MjJfMzM5NTM3ODNf/331673__nicola_ariutti__brass_bell_01_take10.wav";

    // NOME DA CLASSE DE CARREGAMENTO - **ESTA É A PARTE MAIS IMPORTANTE**
    // Procure no inspetor de elementos qual classe CSS é adicionada ao botão
    // ou ao SVG *apenas* durante o carregamento. Exemplos comuns são 'animate-spin',
    // 'animate-pulse', 'loading', 'is-loading'.
    const LOADING_CLASS_NAME = 'animate-spin';

    // --- FIM DA CONFIGURAÇÃO ---


    const audio = new Audio(SOUND_URL);
    function playSound() {
        audio.play().catch(e => console.error("Erro ao tocar o som:", e));
    }

    /**
     * Observa um botão específico para mudanças em sua lista de classes.
     * @param {Element} button - O elemento do botão a ser observado.
     */
    function observeButtonForLoadingState(button) {
        // Guarda o estado inicial
        let wasLoading = button.classList.contains(LOADING_CLASS_NAME);
        console.log(`Observando o botão. Estado inicial de carregamento ('${LOADING_CLASS_NAME}'):`, wasLoading);

        const observer = new MutationObserver(() => {
            const isCurrentlyLoading = button.classList.contains(LOADING_CLASS_NAME);

            // A condição para tocar o som:
            // O botão ESTAVA carregando, mas AGORA NÃO ESTÁ mais.
            if (wasLoading && !isCurrentlyLoading) {
                console.log("Animação de carregamento finalizada. Tocando som.");
                playSound();
            }

            // Atualiza o estado para a próxima verificação
            wasLoading = isCurrentlyLoading;
        });

        // Inicia a observação, focando apenas no atributo 'class' para máxima eficiência
        observer.observe(button, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    /**
     * Aguarda o botão de envio aparecer na página e inicia o observador.
     */
    function waitAndObserve() {
        const sendButton = document.querySelector('button:has(svg[data-icon="paper-plane-top"])');

        if (sendButton) {
            observeButtonForLoadingState(sendButton);
        } else {
            setTimeout(waitAndObserve, 500);
        }
    }

    // Inicia o processo
    waitAndObserve();
})();
