/**
 * 🎉 Sistema de Mensagens de Celebração - ULTIMATE VERSION
 * O site mais belo e funcional possível
 */

// ========================================
// 🎯 CONFIGURAÇÕES GLOBAIS
// ========================================
const App = {
    config: {
        maxChars: 500,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        storageKey: 'celebration_views'
    },
    state: {
        isDarkTheme: true,
        selectedTheme: 'romantic',
        files: { audio: null, photo: null },
        likes: 0,
        hasLiked: false,
        views: 0
    }
};

// ========================================
// 🎨 SELEÇÃO DE TEMA
// ========================================
function selectTheme(themeName) {
    App.state.selectedTheme = themeName;
    
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const selectedBtn = document.querySelector('[data-theme="' + themeName + '"]');
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    const themeNames = {
        romantic: 'Romântico',
        festive: 'Festas',
        elegant: 'Elegante',
        nature: 'Natureza',
        ocean: 'Oceano',
        sunset: 'Pôr do Sol'
    };
    
    showToast('Tema ' + themeNames[themeName] + ' selecionado! 🎨', 'success');
}

window.selectTheme = selectTheme;

// ========================================
// 🚀 INICIALIZAÇÃO
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar partículas
    createParticles();
    
    // Inicializar tema
    initTheme();
    
    // Verificar se é uma página de celebração
    const urlParams = new URLSearchParams(window.location.search);
    const occasion = urlParams.get('occasion');
    const message = urlParams.get('message');

    if (occasion && message) {
        // Página de exibição
        showCelebrationDisplay(parseCelebrationData(urlParams));
        incrementViews();
    } else {
        // Página do formulário
        setupForm();
        setupDragDrop();
        setupEmojiPicker();
        setupCharCounter();
        setupPreview();
    }
});

// ========================================
// 🎆 EFEITOS DE FUNDO
// ========================================
function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (Math.random() * 5 + 8) + 's';
        
        // Tamanho variável
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        container.appendChild(particle);
    }
}

// ========================================
// 🌓 TEMA
// ========================================
function initTheme() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    // Verificar preferência do usuário
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        App.state.isDarkTheme = savedTheme === 'dark';
    }

    toggle.addEventListener('click', () => {
        App.state.isDarkTheme = !App.state.isDarkTheme;
        const theme = App.state.isDarkTheme ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Atualizar ícone
        const icon = toggle.querySelector('i');
        icon.className = App.state.isDarkTheme ? 'fas fa-moon' : 'fas fa-sun';
        
        showToast('Tema alterado!', 'success');
    });
}

// ========================================
// 📝 FORMULÁRIO
// ========================================
function setupForm() {
    const form = document.getElementById('celebration-form');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.submit-btn');
        const originalContent = submitBtn.innerHTML;
        
        // Estado de carregamento
        submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Gerando...</span>';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';

        try {
            // Validar
            if (!validateForm()) {
                throw new Error('Preencha todos os campos obrigatórios');
            }

            // Coletar dados
            const formData = collectFormData();
            
            // Gerar URL
            const fullUrl = generateShareableLink(formData);

            // Mostrar resultado
            displayResult(fullUrl);
            
            showToast('Link criado com sucesso! 🎉', 'success');

        } catch (error) {
            console.error('Erro:', error);
            showToast(error.message || 'Erro ao criar link', 'error');
        } finally {
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    });
}

function validateForm() {
    const occasion = document.getElementById('occasion');
    const message = document.getElementById('message');
    
    return occasion.value.trim() && message.value.trim();
}

function collectFormData() {
    return {
        sender: document.getElementById('sender').value,
        recipient: document.getElementById('recipient').value,
        occasion: document.getElementById('occasion').value,
        message: document.getElementById('message').value,
        link: document.getElementById('link').value,
        youtube: document.getElementById('youtube').value,
        date: document.getElementById('date').value,
        audio: App.state.files.audio,
        photo: App.state.files.photo,
        theme: App.state.selectedTheme,
        likes: [
            document.getElementById('like1').value,
            document.getElementById('like2').value,
            document.getElementById('like3').value
        ].filter(Boolean)
    };
}

function generateShareableLink(formData) {
    const baseUrl = window.location.href.split('?')[0];
    const params = new URLSearchParams();

    // Adicionar parâmetros
    if (formData.sender) params.set('sender', formData.sender);
    if (formData.recipient) params.set('recipient', formData.recipient);
    params.set('occasion', formData.occasion);
    params.set('message', formData.message);
    
    if (formData.link) params.set('link', formData.link);
    if (formData.date) params.set('date', formData.date);
    if (formData.youtube) params.set('youtube', formData.youtube);
    if (formData.theme) params.set('theme', formData.theme);
    
    formData.likes.forEach((like, index) => {
        if (like) params.set('like' + (index + 1), like);
    });

    // Processar arquivos
    if (formData.audio) {
        params.set('audio', formData.audio);
    }
    if (formData.photo) {
        params.set('photo', formData.photo);
    }

    return baseUrl + '?' + params.toString();
}

function displayResult(url) {
    const resultCard = document.getElementById('generated-link');
    const linkOutput = document.getElementById('link-output');
    
    linkOutput.value = url;
    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Animação de entrada
    resultCard.style.animation = 'none';
    resultCard.offsetHeight; // Trigger reflow
    resultCard.style.animation = 'slideUp 0.5s ease';
}

// ========================================
// 📎 DRAG AND DROP
// ========================================
function setupDragDrop() {
    const dropZone = document.getElementById('dropZone');
    if (!dropZone) return;

    const audioInput = document.getElementById('audio');
    const photoInput = document.getElementById('photo');

    // Clique para selecionar
    dropZone.addEventListener('click', () => {
        // Mostrar menu de opções
        showFileOptions();
    });

    // Drag events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        });
    });

    dropZone.addEventListener('drop', handleDrop);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e) {
        const files = e.dataTransfer.files;
        processFiles(files);
    }

    function showFileOptions() {
        const choice = confirm('Deseja enviar uma foto? (OK) ou um áudio? (Cancelar)');
        if (choice) {
            photoInput.click();
        } else {
            audioInput.click();
        }
    }

    // Input events
    audioInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            processFiles(e.target.files, 'audio');
        }
    });

    photoInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            processFiles(e.target.files, 'photo');
        }
    });
}

function processFiles(files, type = null) {
    Array.from(files).forEach(file => {
        // Validar tipo
        const isAudio = file.type.startsWith('audio/');
        const isPhoto = file.type.startsWith('image/');
        
        if (!isAudio && !isPhoto) {
            showToast('Tipo de arquivo inválido!', 'error');
            return;
        }

        // Validar tamanho
        if (file.size > App.config.maxFileSize) {
            showToast('Arquivo muito grande! Máximo 10MB', 'error');
            return;
        }

        // Converter para Base64
        convertToBase64(file).then(base64 => {
            if (isAudio) {
                App.state.files.audio = base64;
                addFileToList(file.name, 'audio');
                showToast('Áudio adicionado! 🎵', 'success');
            } else if (isPhoto) {
                App.state.files.photo = base64;
                addFileToList(file.name, 'photo');
                showToast('Foto adicionada! 📷', 'success');
            }
        });
    });
}

function addFileToList(filename, type) {
    const fileList = document.getElementById('fileList');
    const icon = type === 'audio' ? '🎵' : '📷';
    
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = '<span>' + icon + ' ' + filename + '</span><i class="fas fa-times remove-file" onclick="removeFile(\'' + type + '\')"></i>';
    
    fileList.appendChild(fileItem);
}

function removeFile(type) {
    App.state.files[type] = null;
    // Remover da lista
    const fileList = document.getElementById('fileList');
    const items = fileList.querySelectorAll('.file-item');
    if (type === 'audio' && items.length > 0) {
        items[items.length - 1].remove();
    } else if (type === 'photo') {
        // Encontrar e remover o item de foto
        items.forEach(item => {
            if (item.textContent.includes('📷')) {
                item.remove();
            }
        });
    }
    showToast('Arquivo removido', 'info');
}

// ========================================
// 😊 EMOJI PICKER
// ========================================
function setupEmojiPicker() {
    const trigger = document.getElementById('emojiTrigger');
    const picker = document.getElementById('emojiPicker');
    const messageTextarea = document.getElementById('message');
    
    if (!trigger || !picker) return;

    // Toggle picker
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        picker.style.display = picker.style.display === 'none' ? 'block' : 'none';
    });

    // Fechar ao clicar fora
    document.addEventListener('click', () => {
        picker.style.display = 'none';
    });

    picker.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Categorias de emojis
    const emojis = {
        smileys: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','☺️','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷'],
        hearts: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️','😻','💑','👩‍❤️‍👨','👨‍❤️‍👨','👩‍❤️‍👩','🧡','🤍','💌','💒','🏩','💐','🌹','🥀','🌷','🌸','💮','🏵️'],
        celebration: ['🎉','🎊','🎈','🎁','🏆','🥇','🥈','🥉','⭐','🌟','✨','💫','🔥','💥','🎆','🎇','🧨','🎑','🎃','🎄','🎅','🎉','🎊','🥳','🤗','🙌','👏','👏','🤝','💪','🎯','🎳','🎮','🎰'],
        nature: ['🌸','💮','🏵️','🌹','🥀','🌺','🌻','🌼','🌷','🌱','🌲','🌳','🌴','🌵','🌾','🌿','☘️','🍀','🍁','🍂','🍃','🌍','🌎','🌏','🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘','🌙','⭐','🌟','💫','✨','☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️'],
        food: ['🍰','🎂','🧁','🥧','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🥐','🥖','🥨','🧀','🥞','🧇','🍳','🥚','🥓','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🥙','🧆','🍜','🍝','🍣','🍱','🥟','🥠','🥡','🍧','🍨','🍦','🥤','🧋']
    };

    // Renderizar emojis iniciais
    renderEmojis('smileys');

    // Categorias
    const categories = picker.querySelectorAll('.emoji-cat');
    categories.forEach(cat => {
        cat.addEventListener('click', () => {
            categories.forEach(c => c.classList.remove('active'));
            cat.classList.add('active');
            renderEmojis(cat.dataset.category);
        });
    });

    function renderEmojis(category) {
        const grid = document.getElementById('emojiGrid');
        grid.innerHTML = '';
        
        (emojis[category] || []).forEach(emoji => {
            const btn = document.createElement('button');
            btn.className = 'emoji-btn';
            btn.textContent = emoji;
            btn.addEventListener('click', () => {
                insertEmoji(emoji);
            });
            grid.appendChild(btn);
        });
    }

    function insertEmoji(emoji) {
        const start = messageTextarea.selectionStart;
        const end = messageTextarea.selectionEnd;
        const text = messageTextarea.value;
        
        messageTextarea.value = text.substring(0, start) + emoji + text.substring(end);
        messageTextarea.selectionStart = messageTextarea.selectionEnd = start + emoji.length;
        messageTextarea.focus();
        
        // Atualizar contador
        updateCharCount();
    }
}

// ========================================
// 📏 CONTADOR DE CARACTERES
// ========================================
function setupCharCounter() {
    const textarea = document.getElementById('message');
    const current = document.getElementById('charCurrent');
    
    if (!textarea || !current) return;

    textarea.addEventListener('input', updateCharCount);

    function updateCharCount() {
        const count = textarea.value.length;
        current.textContent = count;
        
        if (count > App.config.maxChars) {
            current.style.color = 'var(--danger)';
        } else if (count > App.config.maxChars * 0.8) {
            current.style.color = 'var(--warning)';
        } else {
            current.style.color = 'rgba(255, 255, 255, 0.6)';
        }
    }
}

// ========================================
// 👁️ PREVIEW
// ========================================
function setupPreview() {
    const inputs = ['occasion', 'recipient', 'sender', 'message'];
    
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updatePreview);
        }
    });
}

function updatePreview() {
    const preview = document.getElementById('preview-card');
    const content = document.getElementById('previewContent');
    
    const occasion = document.getElementById('occasion').value || 'Título da Ocasião';
    const recipient = document.getElementById('recipient').value;
    const sender = document.getElementById('sender').value;
    const message = document.getElementById('message').value || 'Sua mensagem aparecerá aqui...';
    
    // Mostrar preview se houver conteúdo
    if (occasion || message) {
        preview.style.display = 'block';
        
        content.innerHTML = '<h2>' + escapeHtml(occasion) + '</h2>' + (recipient ? '<p><strong>Para:</strong> ' + escapeHtml(recipient) + '</p>' : '') + (sender ? '<p><em>De: ' + escapeHtml(sender) + '</em></p>' : '') + '<p>' + escapeHtml(message.substring(0, 100)) + (message.length > 100 ? '...' : '') + '</p>';
    } else {
        preview.style.display = 'none';
    }
}

// ========================================
// 🎊 EXIBIÇÃO DA CELEBRAÇÃO
// ========================================
function parseCelebrationData(params) {
    return {
        sender: params.get('sender'),
        recipient: params.get('recipient'),
        occasion: params.get('occasion'),
        message: params.get('message'),
        link: params.get('link'),
        date: params.get('date'),
        photo: params.get('photo'),
        youtube: params.get('youtube'),
        audio: params.get('audio'),
        theme: params.get('theme') || 'romantic',
        likes: [
            params.get('like1'),
            params.get('like2'),
            params.get('like3')
        ].filter(Boolean)
    };
}

function showCelebrationDisplay(data) {
    const formContainer = document.getElementById('form-container');
    const displayContainer = document.getElementById('celebration-display');

    formContainer.style.display = 'none';
    displayContainer.style.display = 'block';

    // Aplicar tema personalizado
    if (data.theme) {
        displayContainer.classList.add('theme-' + data.theme);
        
        // Aplicar fundo temático ao body
        document.body.classList.add('theme-background-' + data.theme);
        
        // Adicionar decoração temática
        const decoration = document.createElement('div');
        decoration.className = 'theme-decoration';
        displayContainer.insertBefore(decoration, displayContainer.firstChild);
    }

    // Título
    document.getElementById('occasion-title').textContent = data.occasion;

    // Destinatário
    if (data.recipient) {
        document.getElementById('recipient-text').textContent = 'Para: ' + escapeHtml(data.recipient);
    }

    // Remetente
    if (data.sender) {
        document.getElementById('sender-text').textContent = 'De: ' + escapeHtml(data.sender);
    }

    // Mensagem
    document.getElementById('message-text').textContent = data.message;

    // Data
    if (data.date) {
        const dateElement = document.getElementById('date-text');
        const formattedDate = new Date(data.date).toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        dateElement.textContent = '📅 ' + capitalizeFirst(formattedDate);
        dateElement.style.display = 'inline-block';
    }

    // Link
    if (data.link) {
        const linkElement = document.getElementById('link-text');
        linkElement.innerHTML = '<a href="' + escapeHtml(data.link) + '" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i> ' + truncateUrl(data.link) + '</a>';
    }

    // Likes
    if (data.likes && data.likes.length > 0) {
        const likesElement = document.getElementById('likes-text');
        likesElement.innerHTML = '<h3>Coisas que eu gosto em você</h3><ul>' + data.likes.map(like => '<li>' + escapeHtml(like) + '</li>').join('') + '</ul>';
    }

    // Foto
    if (data.photo) {
        const photoDisplay = document.getElementById('photo-display');
        photoDisplay.src = data.photo;
        photoDisplay.style.display = 'block';
    }

    // YouTube
    if (data.youtube) {
        const videoId = extractYouTubeId(data.youtube);
        if (videoId) {
            embedYouTubePlayer(videoId);
        }
    }

    // Áudio
    if (data.audio) {
        embedAudioPlayer(data.audio);
    }

    // Carregar likes e visualizações
    loadLikesAndViews();

    // Confete
    createElegantConfetti();
}

function embedYouTubePlayer(videoId) {
    const playerContainer = document.getElementById('youtube-player');
    
    playerContainer.innerHTML = '<div class="youtube-container"><iframe src="https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1" title="Música da Celebração" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
    
    playerContainer.style.display = 'block';
}

function embedAudioPlayer(audioBase64) {
    const playerContainer = document.getElementById('audio-player');
    
    playerContainer.innerHTML = '<div class="audio-container"><div class="audio-label">🎶 Música da Celebração</div><audio id="celebration-audio" controls autoplay><source src="' + audioBase64 + '" type="audio/mpeg">Seu navegador não suporta o elemento de áudio.</audio></div>';
    
    playerContainer.style.display = 'block';
    
    const audio = document.getElementById('celebration-audio');
    audio.play().catch(() => {
        console.log('Reprodução automática bloqueada');
    });
}

// ========================================
// ❤️ LIKES E VISUALIZAÇÕES
// ========================================
function loadLikesAndViews() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = btoa(window.location.href).substring(0, 20);
    
    // Carregar likes
    const likes = localStorage.getItem('likes_' + id) || 0;
    App.state.likes = parseInt(likes);
    document.getElementById('likeCount').textContent = App.state.likes;
    
    // Verificar se já liked
    const hasLiked = localStorage.getItem('hasLiked_' + id);
    if (hasLiked) {
        const btn = document.getElementById('likeBtn');
        btn.classList.add('liked');
        App.state.hasLiked = true;
    }

    // Carregar visualizações
    const views = localStorage.getItem('views_' + id) || 1;
    App.state.views = parseInt(views);
    document.getElementById('viewCount').textContent = App.state.views;
}

function incrementViews() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = btoa(window.location.href).substring(0, 20);
    
    let views = parseInt(localStorage.getItem('views_' + id) || '0');
    views++;
    localStorage.setItem('views_' + id, views.toString());
}

function toggleLike() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = btoa(window.location.href).substring(0, 20);
    const btn = document.getElementById('likeBtn');
    
    if (App.state.hasLiked) {
        // Remover like
        App.state.likes = Math.max(0, App.state.likes - 1);
        btn.classList.remove('liked');
        localStorage.setItem('hasLiked_' + id, '');
    } else {
        // Adicionar like
        App.state.likes++;
        btn.classList.add('liked');
        localStorage.setItem('hasLiked_' + id, 'true');
        
        // Efeito de confete extra
        createSingleConfetti();
    }
    
    document.getElementById('likeCount').textContent = App.state.likes;
    localStorage.setItem('likes_' + id, App.state.likes.toString());
    
    showToast(App.state.hasLiked ? 'Like removido' : 'Obrigado pelo amor! ❤️', 'success');
}

// ========================================
// 📋 AÇÕES DE COMPARTILHAMENTO
// ========================================
function copyLink() {
    const linkInput = document.getElementById('link-output');
    
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);

    try {
        document.execCommand('copy');
        showToast('Link copiado! 📋', 'success');
    } catch (err) {
        navigator.clipboard.writeText(linkInput.value).then(() => {
            showToast('Link copiado! 📋', 'success');
        }).catch(() => {
            showToast('Erro ao copiar', 'error');
        });
    }
}

function shareWhatsApp() {
    const linkInput = document.getElementById('link-output');
    const text = encodeURIComponent('Olha que mensagem linda! 🎉\n' + linkInput.value);
    window.open('https://wa.me/?text=' + text, '_blank');
}

function generateQRCode() {
    const linkInput = document.getElementById('link-output');
    const qrContainer = document.getElementById('qrcode-container');
    const qrDiv = document.getElementById('qrcode');
    
    qrDiv.innerHTML = '';
    
    new QRCode(qrDiv, {
        text: linkInput.value,
        width: 200,
        height: 200,
        colorDark: '#1a1a2e',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });
    
    qrContainer.style.display = 'flex';
    
    qrContainer.addEventListener('click', (e) => {
        if (e.target === qrContainer) {
            closeQRCode();
        }
    });
}

function closeQRCode() {
    document.getElementById('qrcode-container').style.display = 'none';
}

function shareCelebration() {
    if (navigator.share) {
        navigator.share({
            title: 'Celebração Especial',
            text: 'Olha que mensagem linda!',
            url: window.location.href
        });
    } else {
        copyLink();
    }
}

// ========================================
// 🎊 EFEITOS DE CONFETE
// ========================================
function createElegantConfetti() {
    const colors = ['#e91e63', '#ff6b9d', '#ffd700', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffa502', '#ff6b6b'];
    const shapes = ['circle', 'square', 'star', 'ribbon'];
    const count = 80;

    for (let i = 0; i < count; i++) {
        setTimeout(() => createSingleConfetti(colors, shapes), i * 50);
    }

    // Confetes contínuos
    setInterval(() => {
        if (document.getElementById('celebration-display').style.display === 'block') {
            createSingleConfetti();
        }
    }, 800);
}

function createSingleConfetti(colors, shapes) {
    if (!colors) colors = ['#e91e63', '#ff6b9d', '#ffd700', '#4ecdc4', '#45b7d1'];
    if (!shapes) shapes = ['circle', 'square', 'star', 'ribbon'];

    const confetti = document.createElement('div');
    confetti.className = 'confetti ' + shapes[Math.floor(Math.random() * shapes.length)];
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = '0s';
    confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';
    confetti.style.setProperty('--drift', (Math.random() * 200 - 100) + 'px');
    
    const size = Math.random() * 10 + 5;
    confetti.style.width = size + 'px';
    confetti.style.height = size + 'px';
    
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 5000);
}

// ========================================
// 🍞 TOAST NOTIFICATIONS
// ========================================
function showToast(message, type) {
    if (!type) type = 'info';
    const toast = document.getElementById('toast');
    const icon = toast.querySelector('.toast-icon');
    const msg = toast.querySelector('.toast-message');
    
    // Ícones
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
    };
    
    toast.className = 'toast ' + type;
    icon.className = 'toast-icon ' + icons[type];
    msg.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========================================
// 🔧 UTILITÁRIOS
// ========================================
function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function truncateUrl(url, maxLength) {
    if (!maxLength) maxLength = 35;
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
}

function extractYouTubeId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) return match[1];
    }
    return null;
}

// Expor funções para o HTML
window.copyLink = copyLink;
window.shareWhatsApp = shareWhatsApp;
window.generateQRCode = generateQRCode;
window.closeQRCode = closeQRCode;
window.removeFile = removeFile;
window.toggleLike = toggleLike;
window.shareCelebration = shareCelebration;
