# Ovosh Server

Сервер для рассылки рандомных картинок "овощей" всем пользователям мода Mytheria.

## Установка и запуск

### Локально

1. Установите Node.js (версия 18 или выше)
2. Установите зависимости:
```bash
npm install
```

3. Запустите сервер:
```bash
npm start
```

Сервер будет доступен на `http://localhost:3000`

### На Render.com

1. Создайте новый Web Service на [Render.com](https://render.com)
2. Подключите репозиторий с этим проектом
3. Укажите следующие настройки:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Region**: Выберите ближайший регион

4. Нажмите "Create Web Service"

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

## Использование в моде

### Команда в чате

```
.ovosh [длительность]
```

Показывает рандомный овощ на экране на указанное время (по умолчанию 5 секунд).

```
.burmalda триключа [ключ] [длительность]
```

Рассылает овощ всем пользователям через сервер. Ключ должен быть сгенерирован на сервере.

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
- По умолчанию используется ключ `SHIFT-ANDROID-SECRET-KEY-POTOLOK` для команды `.burmalda`

## Веб-интерфейс

После запуска сервера откройте `http://localhost:3000` в браузере для управления:

- Просмотр статуса сервера
- Генерация новых ключей
- Управление активными ключами
- Отправка рассылки овощей