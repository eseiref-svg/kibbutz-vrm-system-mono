
/**
 * Helper function to create an address record.
 * @param {object} client - The database client or pool to run the query.
 * @param {object} addressData - The address data { street, street_name, house_no, city, zip_code, phone_no, additional }.
 * @returns {Promise<number|null>} - Returns the address_id or null if no data provided.
 */
async function createAddress(client, addressData) {
    if (!addressData || (!addressData.street && !addressData.street_name && !addressData.city)) {
        // If no meaningful address data is provided, return null (no address created)
        return null;
    }

    const streetName = addressData.street_name || addressData.street;
    const { house_no, city, zip_code, phone_no, additional } = addressData;

    const res = await client.query(
        'INSERT INTO address (street_name, house_no, city, zip_code, phone_no, additional) VALUES ($1, $2, $3, $4, $5, $6) RETURNING address_id',
        [streetName, house_no, city, zip_code, phone_no, additional]
    );
    return res.rows[0].address_id;
}

/**
 * Helper function to update an existing address record.
 * @param {object} client - The database client or pool.
 * @param {number} addressId - The ID of the address to update.
 * @param {object} addressData - The new address data.
 */
async function updateAddress(client, addressId, addressData) {
    if (!addressId || !addressData) return;

    const streetName = addressData.street_name || addressData.street;
    const { house_no, city, zip_code, phone_no, additional } = addressData;

    // Build dynamic update query to avoid overwriting with nulls if not provided? 
    // Or assume full update? 
    // For now we do essentially what the previous code did: update provided fields.
    // The previous code in client update was:
    // UPDATE address SET city = COALESCE($1, city), ...
    // Let's implement COALESCE logic here for robustness.

    await client.query(
        `UPDATE address 
         SET street_name = COALESCE($1, street_name), 
             house_no = COALESCE($2, house_no), 
             city = COALESCE($3, city), 
             zip_code = COALESCE($4, zip_code), 
             phone_no = COALESCE($5, phone_no),
             additional = COALESCE($6, additional),
             updated_at = NOW() 
         WHERE address_id = $7`,
        [streetName, house_no, city, zip_code, phone_no, additional, addressId]
    );
}

module.exports = {
    createAddress,
    updateAddress
};
