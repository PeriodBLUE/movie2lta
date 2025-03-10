// 配置参数
const config = {
    transitionInterval: 5000, // 切换间隔时间（毫秒）
    transitionDuration: 1000, // 过渡动画时长（毫秒）
    showColorDuration: 3000,  // 纯色背景显示时长（毫秒）
};

// 添加全局模态框控制函数
function showModal(imagePath, movieName) {
    const modal = document.getElementById('posterModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');

    modalImage.src = imagePath;
    modalTitle.textContent = movieName;
    
    // 确保图片加载完成后再显示模态框
    modalImage.onload = () => {
        modal.classList.add('show');
    };
}

function closeModal() {
    const modal = document.getElementById('posterModal');
    modal.classList.remove('show');
}

// 点击模态框背景关闭
document.getElementById('posterModal').addEventListener('click', (e) => {
    if (e.target.id === 'posterModal') {
        closeModal();
    }
});

// ESC键关闭模态框
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

class PosterManager {
    constructor() {
        console.log('初始化 PosterManager...');
        this.posterWall = document.getElementById('posterWall');
        this.allPosters = []; // 存储所有加载的海报
        this.currentPosters = []; // 当前显示的海报
        this.transitionInProgress = false;
        
        // 动画配置
        this.config = {
            singleFlipDuration: 1000,    // 单张翻转动画时长（毫秒）
            delayBetweenFlips: 100,    // 两张海报翻转之间的延迟（毫秒）
            intervalBetweenSets: 2000,  // 一组翻转完成后的等待时间（毫秒）
        };
        
        if (!this.posterWall) {
            console.error('找不到海报墙元素！');
            return;
        }

        this.movieFolders = [
            '麦兜',
            '路边野餐',
            '蓝色大门',
            '大佛普拉斯',
            'transpotting',
            'The Secret Life of Walter Mitty',
            'The Hours',
            'Stock and Two Smoking Barrels',
            'Le Fabuleux Destin d\'Amélie Poulain',
            'Fire of Love',
            'detachment'
        ];
        
        this.init();
    }

    async init() {
        console.log('开始加载海报...');
        await this.loadPosters();
        if (this.allPosters.length > 0) {
            this.startTransitions();
        }
    }

    createPosterElement(posterPath, movieName) {
        const container = document.createElement('div');
        container.className = 'poster-container';

        const poster = document.createElement('div');
        poster.className = 'poster-background';
        poster.style.backgroundImage = `url('${posterPath}')`;

        const title = document.createElement('div');
        title.className = 'movie-title';
        title.textContent = movieName;

        // 添加点击事件
        container.addEventListener('click', () => {
            showModal(posterPath, movieName);
        });

        container.appendChild(poster);
        container.appendChild(title);
        return container;
    }

    async tryLoadImage(path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = path;
        });
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async loadPosters() {
        try {
            console.log('开始遍历电影文件夹...');
            
            for (const folder of this.movieFolders) {
                console.log(`处理文件夹: ${folder}`);
                const images = ['1.jpg', '2.jpg', '3.jpg', 'p1.jpg', 'p2.jpg','p3.jpg','p4.jpg','p5.jpg','4.jpg','5.jpg','6.jpg','7.jpg','8.jpg','9.jpg','10.jpg'];

                for (const imgName of images) {
                    const posterPath = `images/${folder}/${imgName}`;
                    const success = await this.tryLoadImage(posterPath);
                    if (success) {
                        console.log(`成功加载图片: ${posterPath}`);
                        this.allPosters.push({
                            path: posterPath,
                            movieName: folder
                        });
                    }
                }
            }

            console.log(`总共成功加载了 ${this.allPosters.length} 张海报`);
            if (this.allPosters.length === 0) {
                console.error('没有找到任何可用的海报图片！');
                this.showErrorMessage();
            } else {
                // 初始显示
                this.updateDisplay();
            }
        } catch (error) {
            console.error('加载海报时发生错误:', error);
            this.showErrorMessage();
        }
    }

    updateDisplay() {
        // 清空当前显示
        this.posterWall.innerHTML = '';
        
        // 随机选择海报
        const postersToShow = [...this.allPosters];
        this.shuffleArray(postersToShow);
        
        // 计算需要显示的海报数量（基于网格大小）
        const gridColumns = window.innerWidth > 1200 ? 6 : 
                          window.innerWidth > 768 ? 4 : 
                          window.innerWidth > 480 ? 3 : 2;
        const gridRows = 3; // 固定3行
        const postersCount = gridColumns * gridRows;
        
        // 显示海报
        postersToShow.slice(0, postersCount).forEach(poster => {
            const element = this.createPosterElement(poster.path, poster.movieName);
            this.posterWall.appendChild(element);
        });
        
        this.currentPosters = Array.from(this.posterWall.children);
    }

    async transitionPosters() {
        if (this.transitionInProgress) return;
        this.transitionInProgress = true;

        // 准备新的海报数据
        const postersToShow = [...this.allPosters];
        this.shuffleArray(postersToShow);
        
        // 计算网格大小
        const gridColumns = window.innerWidth > 1200 ? 6 : 
                          window.innerWidth > 768 ? 4 : 
                          window.innerWidth > 480 ? 3 : 2;
        const gridRows = 3;
        const postersCount = gridColumns * gridRows;
        
        // 获取当前显示的所有海报元素
        const currentElements = Array.from(this.posterWall.children);
        
        // 按顺序翻转每个海报
        for (let i = 0; i < postersCount; i++) {
            const currentElement = currentElements[i];
            if (!currentElement) continue;

            // 添加翻出动画
            currentElement.classList.add('shutter-out');
            
            // 等待翻出动画完成
            await new Promise(resolve => setTimeout(resolve, this.config.singleFlipDuration));
            
            // 创建并添加新海报
            const newPoster = postersToShow[i % postersToShow.length];
            const newElement = this.createPosterElement(newPoster.path, newPoster.movieName);
            newElement.classList.add('shutter-in');
            
            // 替换旧海报
            currentElement.replaceWith(newElement);
            
            // 等待下一次翻转前的延迟
            await new Promise(resolve => setTimeout(resolve, this.config.delayBetweenFlips));
        }

        // 更新当前海报列表
        this.currentPosters = Array.from(this.posterWall.children);
        
        // 等待一组翻转完成后的间隔时间
        await new Promise(resolve => setTimeout(resolve, this.config.intervalBetweenSets));
        
        this.transitionInProgress = false;
    }

    startTransitions() {
        // 初始化定时器
        const startNextTransition = () => {
            this.transitionPosters().then(() => {
                // 在一组翻转完成后，设置下一次翻转的定时器
                setTimeout(startNextTransition, 100);
            });
        };
        
        // 开始第一次翻转
        startNextTransition();
    }

    showErrorMessage() {
        const errorMsg = document.createElement('div');
        errorMsg.style.color = 'white';
        errorMsg.style.padding = '20px';
        errorMsg.style.textAlign = 'center';
        errorMsg.textContent = '无法加载海报图片，请检查图片路径是否正确。';
        this.posterWall.appendChild(errorMsg);
    }
}

// 当页面加载完成后初始化海报管理器
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面加载完成，初始化 PosterManager...');
    new PosterManager();
}); 