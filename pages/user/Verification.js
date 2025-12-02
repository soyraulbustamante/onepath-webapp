// Verification.js - Manejo de verificación de identidad en OnePath

(function () {
    'use strict';

    const FOTO_KEY = 'onepath_verification_photo';

    // DOM
    const fotoInput = document.getElementById('fotoInput');
    const previewArea = document.getElementById('previewArea');
    const previewImg = document.getElementById('previewImg');
    const verificationForm = document.getElementById('verificationForm');
    const verificationMessage = document.getElementById('verificationMessage');
    const profilePhoto = document.getElementById('profilePhoto');

    // Mostrar vista previa
    fotoInput.addEventListener('change', () => {
        const file = fotoInput.files[0];

        if (!file) return;

        // Validar formato
        if (!['image/png', 'image/jpeg'].includes(file.type)) {
            showError('Formato inválido. Solo se aceptan PNG o JPG.');
            fotoInput.value = '';
            previewArea.classList.add('hidden');
            return;
        }

        // Crear vista previa
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewArea.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    });

    // Guardar foto
    verificationForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const file = fotoInput.files[0];
        if (!file) {
            showError('Por favor selecciona una foto.');
            return;
        }

        if (!['image/png', 'image/jpeg'].includes(file.type)) {
            showError('Formato inválido. Solo se aceptan PNG o JPG.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            localStorage.setItem(FOTO_KEY, e.target.result);
            showSuccess('Foto guardada correctamente.');
            loadProfilePhoto();
        };

        reader.readAsDataURL(file);
    });

    // Cargar foto del perfil
    function loadProfilePhoto() {
        const savedPhoto = localStorage.getItem(FOTO_KEY);
        if (savedPhoto && profilePhoto) {
            profilePhoto.src = savedPhoto;
        }
    }

    // Mostrar error
    function showError(msg) {
        verificationMessage.textContent = msg;
        verificationMessage.classList.add('error');
        verificationMessage.classList.remove('success');
    }

    // Mostrar éxito
    function showSuccess(msg) {
        verificationMessage.textContent = msg;
        verificationMessage.classList.add('success');
        verificationMessage.classList.remove('error');
    }

    // Inicializar
    document.addEventListener('DOMContentLoaded', loadProfilePhoto);

})();