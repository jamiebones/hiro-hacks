const DataDisplay = ({data}) => {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Data Display</h1>
        <div className="bg-white shadow-md rounded-md p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Apply</h2>
            {data.apply.map((applyItem, index) => (
              <div key={index} className="border-b py-2">
                <div className="mb-1">
                  <span className="font-semibold">Block Identifier: </span>{applyItem.block_identifier.index}
                </div>
                <div className="mb-1">
                  <span className="font-semibold">Parent Block Identifier: </span>{applyItem.parent_block_identifier.index}
                </div>
                <div className="mb-1">
                  <span className="font-semibold">Timestamp: </span>{new Date(applyItem.timestamp * 1000).toLocaleString()}
                </div>
                <div className="mb-1">
                  <span className="font-semibold">Transactions: </span>
                  {applyItem.transactions.map((transaction, index) => (
                    <div key={index} className="ml-4">
                      <div className="mb-1">
                        <span className="font-semibold">Transaction Hash: </span>{transaction.transaction_identifier.hash}
                      </div>
                      <div className="mb-1">
                        <span className="font-semibold">Operations: </span>
                        {transaction.operations.map((operation, index) => (
                          <div key={index} className="ml-4">
                            <div className="mb-1">
                              <span className="font-semibold">Type: </span>{operation.type}
                            </div>
                            <div className="mb-1">
                              <span className="font-semibold">Status: </span>{operation.status}
                            </div>
                            <div className="mb-1">
                              <span className="font-semibold">Account Address: </span>{operation.account.address}
                            </div>
                            <div className="mb-1">
                              <span className="font-semibold">Amount: </span>{operation.amount.value} {operation.amount.currency.symbol}
                            </div>
                            {/* Add more details as needed */}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Rollback</h2>
            {data.rollback.map((rollbackItem, index) => (
              <div key={index} className="border-b py-2">
                {Object.entries(rollbackItem).map(([key, value]) => (
                  <div key={key} className="mb-1">
                    <span className="font-semibold">{key}: </span>{JSON.stringify(value)}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Chainhook</h2>
            <div className="border-b py-2">
              {Object.entries(data.chainhook).map(([key, value]) => (
                <div key={key} className="mb-1">
                  <span className="font-semibold">{key}: </span>{JSON.stringify(value)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default DataDisplay;