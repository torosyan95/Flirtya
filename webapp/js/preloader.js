javascript
// Предзагрузка изображений
document.addEventListener('DOMContentLoaded', function() {
    // Список всех изображений
    const imagesList = [
        'assets/images/logo.svg',
        'assets/images/onboarding-1.svg',
        'assets/images/onboarding-2.svg',
        'assets/images/onboarding-3.svg',
        'assets/icons/like.svg',
        'assets/icons/dislike.svg',
        'assets/icons/superlike.svg'
    ];
    
    // Предзагрузка изображений
    const preloadImages = () => {
        const imgPromises = imagesList.map(src => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(src);
                img.onerror = () => {
                    console.error(`Failed to load image: ${src}`);
                    reject(src);
                };
                img.src = src;
            });
        });
        
        Promise.all(imgPromises)
            .then(() => console.log('All images loaded successfully'))
            .catch(failures => console.error('Some images failed to load:', failures));
    };
    
    // Исправление для изображений
    const fixImages = () => {
        document.querySelectorAll('img').forEach(img => {
            // Добавляем обработчик ошибки для всех изображений
            img.onerror = function() {
                // Пытаемся исправить путь или показать запасное изображение
                const src = img.getAttribute('src');
                if (src && !src.startsWith('data:')) {
                    // Пробуем добавить базовый путь
                    const newSrc = src.startsWith('/') ? src.substring(1) : src;
                    if (src !== newSrc) {
                        console.log(`Trying alternative path: ${newSrc}`);
                        this.src = newSrc;
                    } else {
                        // Показываем запасное изображение
                        console.log(`Using fallback for: ${src}`);
                        this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIzNiI+Pz88L3RleHQ+PC9zdmc+';
                    }
                }
            };
            
            // Сразу проверяем изображение
            if (img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
                img.onerror();
            }
        });
    };
    
    preloadImages();
    setTimeout(fixImages, 1000); // Небольшая задержка, чтобы страница успела загрузиться
});
