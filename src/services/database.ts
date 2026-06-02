import { Score, Measure, PracticeSession } from '@/types'

const DB_NAME = 'SightReaderDB'
const SCORES_STORE = 'scores'
const MEASURES_STORE = 'measures'
const SESSIONS_STORE = 'sessions'
const DB_VERSION = 1

let dbInstance: IDBDatabase | null = null

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(SCORES_STORE)) {
        db.createObjectStore(SCORES_STORE, { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains(MEASURES_STORE)) {
        const measureStore = db.createObjectStore(MEASURES_STORE, { keyPath: 'id' })
        measureStore.createIndex('scoreId', 'scoreId', { unique: false })
        measureStore.createIndex('order', 'order', { unique: false })
      }

      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        const sessionStore = db.createObjectStore(SESSIONS_STORE, { keyPath: 'id' })
        sessionStore.createIndex('scoreId', 'scoreId', { unique: false })
      }
    }
  })
}

function dbPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export const db = {
  async addScore(score: Score): Promise<void> {
    const database = await getDB()
    const transaction = database.transaction([SCORES_STORE], 'readwrite')
    const store = transaction.objectStore(SCORES_STORE)
    return dbPromise(store.add(score))
  },

  async getScore(id: string): Promise<Score | undefined> {
    const database = await getDB()
    const transaction = database.transaction([SCORES_STORE], 'readonly')
    const store = transaction.objectStore(SCORES_STORE)
    return dbPromise(store.get(id))
  },

  async getAllScores(): Promise<Score[]> {
    const database = await getDB()
    const transaction = database.transaction([SCORES_STORE], 'readonly')
    const store = transaction.objectStore(SCORES_STORE)
    return dbPromise(store.getAll())
  },

  async updateScore(score: Score): Promise<void> {
    const database = await getDB()
    const transaction = database.transaction([SCORES_STORE], 'readwrite')
    const store = transaction.objectStore(SCORES_STORE)
    return dbPromise(store.put(score))
  },

  async deleteScore(id: string): Promise<void> {
    const database = await getDB()
    const transaction = database.transaction([SCORES_STORE], 'readwrite')
    const store = transaction.objectStore(SCORES_STORE)
    return dbPromise(store.delete(id))
  },

  async addMeasure(measure: Measure): Promise<void> {
    const database = await getDB()
    const transaction = database.transaction([MEASURES_STORE], 'readwrite')
    const store = transaction.objectStore(MEASURES_STORE)
    return dbPromise(store.add(measure))
  },

  async getMeasure(id: string): Promise<Measure | undefined> {
    const database = await getDB()
    const transaction = database.transaction([MEASURES_STORE], 'readonly')
    const store = transaction.objectStore(MEASURES_STORE)
    return dbPromise(store.get(id))
  },

  async getMeasuresByScoreId(scoreId: string): Promise<Measure[]> {
    const database = await getDB()
    const transaction = database.transaction([MEASURES_STORE], 'readonly')
    const store = transaction.objectStore(MEASURES_STORE)
    const index = store.index('scoreId')
    const result = await dbPromise(index.getAll(scoreId))
    return result.sort((a, b) => a.order - b.order)
  },

  async updateMeasure(measure: Measure): Promise<void> {
    const database = await getDB()
    const transaction = database.transaction([MEASURES_STORE], 'readwrite')
    const store = transaction.objectStore(MEASURES_STORE)
    return dbPromise(store.put(measure))
  },

  async deleteMeasure(id: string): Promise<void> {
    const database = await getDB()
    const transaction = database.transaction([MEASURES_STORE], 'readwrite')
    const store = transaction.objectStore(MEASURES_STORE)
    return dbPromise(store.delete(id))
  },

  async deleteMeasuresByScoreId(scoreId: string): Promise<void> {
    const measures = await this.getMeasuresByScoreId(scoreId)
    const database = await getDB()
    const transaction = database.transaction([MEASURES_STORE], 'readwrite')
    const store = transaction.objectStore(MEASURES_STORE)

    for (const measure of measures) {
      store.delete(measure.id)
    }

    return new Promise((resolve, reject) => {
      transaction.onerror = () => reject(transaction.error)
      transaction.oncomplete = () => resolve()
    })
  },

  async addSession(session: PracticeSession): Promise<void> {
    const database = await getDB()
    const transaction = database.transaction([SESSIONS_STORE], 'readwrite')
    const store = transaction.objectStore(SESSIONS_STORE)
    return dbPromise(store.add(session))
  },

  async getSessionsByScoreId(scoreId: string): Promise<PracticeSession[]> {
    const database = await getDB()
    const transaction = database.transaction([SESSIONS_STORE], 'readonly')
    const store = transaction.objectStore(SESSIONS_STORE)
    const index = store.index('scoreId')
    return dbPromise(index.getAll(scoreId))
  },
}
