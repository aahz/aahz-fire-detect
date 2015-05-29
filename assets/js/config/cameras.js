module.exports = [
    // Web Cameras
    {
        'title': 'Встроенная камера ASUS G56JR',
        'type': 'webcam',
        'connection': {
            'type': 'webcam',
            'index': 0,
            'fps': 25,
            'detectionBase': 'movement'
        }
    },
    {
        'title': 'Microsoft LifeCam HD',
        'type': 'webcam',
        'connection': {
            'type': 'webcam',
            'index': 1,
            'fps': 25
        }
    },
    
    // Demo Clips
    {
        'title': 'Стандартный тест, небольшое динамическое пламя, средняя дистанция',
        'type': 'clip',
        'connection': {
            'type': 'clip',
            'url': 'demo/01.mp4',
            'fps': 25
        }
    },
    {
        'title': 'Стандартный тест, небольшое динамическое пламя, малая дистанция',
        'type': 'clip',
        'connection': {
            'type': 'clip',
            'url': 'demo/02.mp4',
            'fps': 25
        }
    },
    {
        'title': 'Тест повышенной сложности, небольшое динамическое пламя',
        'type': 'clip',
        'connection': {
            'type': 'clip',
            'url': 'demo/03.mp4',
            'fps': 25,
            'detectionBase': 'movement'
        }
    },
    {
        'title': 'Лесной пожар, динамическое пламя, малая дистанция без задымления',
        'type': 'clip',
        'connection': {
            'type': 'clip',
            'url': 'demo/04.mp4',
            'fps': 25
        }
    },
    {
        'title': 'Лесной пожар, статическое пламя, малая дистанция без задымления',
        'type': 'clip',
        'connection': {
            'type': 'clip',
            'url': 'demo/06.mp4',
            'fps': 25
        }
    },
    {
        'title': 'Лесной пожар, статическое пламя, малая дистанция с обильным задымлением',
        'type': 'clip',
        'connection': {
            'type': 'clip',
            'url': 'demo/10.mp4',
            'fps': 25
        }
    },
    {
        'title': 'Лесной пожар, статическое пламя и всполохи, средняя дистанция',
        'type': 'clip',
        'connection': {
            'type': 'clip',
            'url': 'demo/07.mp4',
            'fps': 25
        }
    },
    {
        'title': 'Лесной пожар, статическое пламя и всполохи, средняя дистанция',
        'type': 'clip',
        'connection': {
            'type': 'clip',
            'url': 'demo/09.mp4',
            'fps': 25
        }
    },
    {
        'title': 'Лесной пожар, небольшое статическое пламя и всполохи, средняя дистанция',
        'type': 'clip',
        'connection': {
            'type': 'clip',
            'url': 'demo/11.mp4',
            'fps': 25
        }
    },
    {
        'title': 'Пламенные всполохи, полное задымление',
        'type': 'clip',
        'connection': {
            'type': 'clip',
            'url': 'demo/12.mp4',
            'fps': 25
        }
    }
];