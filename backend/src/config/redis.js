import "dotenv/config";

let activeClient = null;
let connectionAttempted = false;

const unavailable = () => {
  throw new Error("Redis is not connected");
};

const redisClient = {
  get isReady() {
    return activeClient?.isReady || false;
  },
  get: (...args) => (activeClient ? activeClient.get(...args) : unavailable()),
  set: (...args) => (activeClient ? activeClient.set(...args) : unavailable()),
  setEx: (...args) =>
    activeClient ? activeClient.setEx(...args) : unavailable(),
  del: (...args) => (activeClient ? activeClient.del(...args) : unavailable()),
  sendCommand: (...args) =>
    activeClient ? activeClient.sendCommand(...args) : unavailable(),
};

export const connectRedis = async () => {
  if (!process.env.REDIS_URL || connectionAttempted) {
    return isRedisReady();
  }

  connectionAttempted = true;

  try {
    const { createClient } = await import("redis");

    activeClient = createClient({
      url: process.env.REDIS_URL,
    });

    activeClient.on("error", (error) => {
      console.error("Redis Client Error:", error.message);
    });

    await Promise.race([
      activeClient.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis connection timeout")), 3000)
      ),
    ]);

    console.log("Redis Connected");
    return true;
  } catch (error) {
    activeClient = null;
    console.error("Redis Connection Failed:", error.message);
    return false;
  }
};

export const isRedisReady = () => redisClient.isReady;

export default redisClient;
