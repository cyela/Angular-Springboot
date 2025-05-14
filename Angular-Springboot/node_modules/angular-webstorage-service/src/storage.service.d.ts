/**
 * Interface for objects that can be used to store data. The service is expected to story any kind of data that can be serialized as a JSON
 * string. Other data such as DOM nodes or Blob instances might be supported by specific implementations of this interface, however you
 * should not rely on such support by the storage service.
 */
export interface StorageService {
    /**
     * Retrieves the value stored for the entry that is associated with the specified key. If no such entry exists or if the service for
     * some reason is unable to fetch the value of the entry then `null` will be returned.
     *
     * @param   key Identifier of the entry whose value is to be retrieved.
     * @returns     Value of the entry that is identified by the specified key or `null` if the entry does not exist or cannot be loaded.
     */
    get(key: string): any;
    /**
     * Creates or updates the entry identified by the specified key with the given value. Storing a value into the storage service will
     * ensure that an equivalent of the value can be read back, i.e. the data and structure of the value will be the same. It, however, does
     * not necessarily return the same value, i.e. the same reference.
     *
     * @param key   Identifier of the entry which is to be created or updated.
     * @param value Value which is to be stored.
     */
    set(key: string, value: any): void;
    /**
     * Removes the entry that is identified by the specified key. Attempting to remove an entry for an unknown key will have no effect.
     * Attempting to retrieve an entry via the `get` method after it has been removed will result in `null`.
     *
     * @param key Identifier of the entry which is to be removed.
     */
    remove(key: string): void;
}
