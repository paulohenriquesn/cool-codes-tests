type CacheData<T = any> = {
    key: string
    value: T
    expiresIn?: Date
}

class MyCache {
    private cache: Map<string, CacheData> = new Map<string,CacheData>();
    private keysThatHasExpiration: any[] = []
    private maxKeys: number = 2

    get(key: string): CacheData | null {
        const cache = this.cache.get(key)

        if (!cache) return null

        if (cache.expiresIn && cache.expiresIn.toTimeString() > new Date().toTimeString()) {
            this.cache.delete(key)
            return null
        }

        return cache
    }

    set<T>(data: CacheData<T>): void {

        if (this.cache.size >= this.maxKeys) {
            this.clearExpired(true)
            if (this.cache.size >= this.maxKeys) {
                throw new Error('max keys exceeded.')
            }
        }

        if (data.expiresIn) {
            this.keysThatHasExpiration.push(data)
        }

        this.cache.set(data.key, data)
    }

    clearExpired(isFull=false): void {

        const will_expires_today_object: CacheData | null = this.get('will_expires_today')

        if(will_expires_today_object) {
            for(let i =0;i<will_expires_today_object.value.length;i++) {
                if(will_expires_today_object.value[i].expiresIn && Date.now() > will_expires_today_object.value[i].expiresIn ) {
                    this.cache.delete(will_expires_today_object.value[i].key)
                    delete this.keysThatHasExpiration[will_expires_today_object.value[i].key]
                    will_expires_today_object.value.splice(i, 1)
                    if(will_expires_today_object.value.length === 0) {
                        this.cache.delete("will_expires_today")
                    }
                }
            }
            return;
        }

        const now = new Date()

        const leftToExpires = []

        for(let i=0;i<this.keysThatHasExpiration.length;i++) {
            console.log(i)
            if (
                this.keysThatHasExpiration[i].expiresIn.getDate() == now.getDate()
                &&
                this.keysThatHasExpiration[i].expiresIn.getMonth() == now.getMonth()
            ) {
                if(this.keysThatHasExpiration[i].expiresIn && now  > this.keysThatHasExpiration[i].expiresIn ) {
                    this.cache.delete(this.keysThatHasExpiration[i].key)
                    delete this.keysThatHasExpiration[this.keysThatHasExpiration[i].key]
                }else {
                    leftToExpires.push(this.keysThatHasExpiration[i])
                }
            }else if( this.keysThatHasExpiration[i].expiresIn.getDate() > now.getDate()
                && this.keysThatHasExpiration[i].expiresIn.getMonth() == now.getMonth()) {
                break;
            }
        }

        if(!isFull) {
            this.set<any>({
                key: "will_expires_today",
                value: leftToExpires
            })
        }

    }
}

const myBeautifulCache = new MyCache()

myBeautifulCache.set({
    key: "test",
    value: 123
})

myBeautifulCache.set({
    key: "test1",
    value: 1234
})
myBeautifulCache.set({
    key: "test2",
    value: 12345
})
