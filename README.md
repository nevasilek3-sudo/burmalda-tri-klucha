# Ovosh Server

Сервер для рассылки рандомных картинок "овощей" всем пользователям мода Mytheria.

## Деплой на Render.com

Сервер уже задеплоен по адресу: **https://burmalda-tri-klucha.onrender.com**

### Создание своего сервера:

1. Создайте новый Web Service на [Render.com](https://render.com)
2. Подключите репозиторий с этим проектом
3. Укажите следующие настройки:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Region**: Выберите ближайший регион
   - **Port**: 10000 (в настройках сервера)

4. Нажмите "Create Web Service"

## Использование

### В игре

Команда `.ovosh [длительность]` - показывает рандомный овощ на экране на указанное время (по умолчанию 5 секунд).

### Через веб-интерфейс

Откройте `https://burmalda-tri-klucha.onrender.com` в браузере и нажмите кнопку **"Broadcast Ovosh"**. Картинка появится у всех пользователей мода на указанное время (по умолчанию 10 секунд).

## API Endpoints

### POST /broadcast
Отправляет команду на рассылку овоща всем пользователям.

**Body:**
```json
{
  "duration": 10000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Broadcast started",
  "duration": 10000
}
```

### POST /generate-key
Генерирует новый ключ для доступа к серверу.

**Response:**
```json
{
  "success": true,
  "key": "SHIFT-ANDROID-SECRET-ABC123...-KEY-POTOLOK",
  "message": "Key generated successfully"
}
```

### POST /delete-key
Удаляет ключ.

**Body:**
```json
{
  "key": "SHIFT-ANDROID-SECRET-ABC123...-KEY-POTOLOK"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Key deleted successfully"
}
```

### GET /keys
Получает список активных ключей.

**Response:**
```json
{
  "success": true,
  "keys": [
    {
      "key": "SHIFT-ANDROID-SECRET-ABC123...-KEY-POTOLOK",
      "created": 1715500000000
    }
  ],
  "count": 1
}
```

### GET /status
Получает текущий статус сервера.

**Response:**
```json
{
  "success": true,
  "isActive": false,
  "remainingTime": 0,
  "activeBroadcast": null
}
```

### GET /health
Проверка работоспособности сервера.

**Response:**
```json
{
  "success": true,
  "timestamp": 1715500000000,
  "activeKeys": 1,
  "activeBroadcast": false
}
```

## Структура проекта

```
render.com/
├── server.js          # Основной файл сервера
├── package.json       # Зависимости
├── public/            # Статические файлы (веб-интерфейс)
│   └── index.html     # Веб-интерфейс управления
└── keys.json          # Файл хранения ключей (автоматически создается)
```

## Безопасность

- Ключи хранятся в файле `keys.json` в корне проекта
- Ключи не сбрасываются после перезапуска сервера
- Ключи можно генерировать и удалять через API или веб-интерфейс