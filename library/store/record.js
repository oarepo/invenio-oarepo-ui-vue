/* eslint "import/prefer-default-export": "off" */

import { Action, Module, VuexModule, Mutation } from 'vuex-class-modules'
import axios from 'axios'
import { State } from './types'


@Module({
    generateMutationSetters: true
})
class RecordModule extends VuexModule {

    /** @type {ConfigModule} */
    config = null

    state = State.INVALID

    record = {}

    metadata = {}

    links = {}

    created = null

    updated = null

    collectionId = null

    recordId = null

    reloadNeeded = false

    constructor (config, options) {
        super(options)
        this.config = config
    }

    get recordURL () {
        return this.config.recordURL(this.collectionId, this.recordId)
    }

    get loaded () {
        return this.state === State.LOADED
    }

    @Action
    async load ({ collectionId, recordId }) {
        this.collectionId = collectionId
        this.recordId = recordId

        return this.reload()
    }

    @Mutation
    setResponse(response) {
        const record = response.data
        this.config.collectionRecordPreprocessors(this.collectionId).call(record, { record: this })

        this.record = record

        this.metadata = record.metadata
        this.links = record.links
        this.created = record.created
        this.updated = record.updated
    }

    @Action
    async reload () {
        this.state = State.LOADING
        const response = await axios.get(this.recordURL, {
            headers: {
                Accept: 'application/json'
            }
        })
        this.setResponse(response)
        this.state = State.LOADED
        return response.data
    }

    @Action
    async patch (data) {
        this.state = State.LOADING
        if (!Array.isArray(data)) {
            data = [data]
        }
        const resp = await axios.patch(this.recordURL, data, {
            headers: {
                'Content-Type': 'application/json-patch+json'
            }
        })
        this.setResponse(resp)
        this.state = State.LOADED
        return resp.data
    }

    @Action
    async save () {
        this.state = State.LOADING
        const resp = await axios.post(this.recordURL, this.record.metadata, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        this.setResponse(resp)
        this.state = State.LOADED
        return resp.data
    }
}

export {
    RecordModule
}