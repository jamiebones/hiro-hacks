   ;;the shares will be the token
   (use-trait sip10-token .ptoken.sip-010-trait)
   (define-constant less-than-zero-error (err u200))
   (define-constant insufficient-token-balance (err u201))
   (define-constant token-transfer-failed (err u202))
   (define-constant no-liquidity-for-payout (err u207))
    (define-constant not-the-owner-error (err u400))
   (define-constant maxUtilizationPercentage u90)

   

   (define-map balances principal uint )
   (define-data-var totalSupply uint u0)

    (define-private (mint (to principal) (shares uint)) 
      (begin 
        (
            let (
                  ( prevTotalSupply (var-get totalSupply))
                )
            (var-set totalSupply (+ prevTotalSupply shares))
           
        )
          (match (map-get? balances to ) prevBalance
                (map-set balances to (+ prevBalance shares))
                (map-set balances to shares)
                   
          )
        (print "shares minted")
      )
    )


    (define-private (burn (from principal) (shares uint)) 
        (begin 
           (
                let (
                    (prevTotalSupply (var-get totalSupply))
                )
                 (var-set totalSupply (- prevTotalSupply shares))
             )

                (match (map-get? balances from ) prevBalance
                 (map-set balances from (- prevBalance shares))
                 false ;;why did this work?
                   
            )
           (print "shares burnt")
           
        )
    )

    ;; (define-private (checkLiquidity)
    ;;    (
    ;;     let (
    ;;        (totalInterest (try! (contract-call? .perpsprotocol calTotalInterest )))
    ;;        (totalDeposit  (unwrap! (contract-call? .ptoken get-balance (as-contract tx-sender)) (err u78)))
    ;;     )
    ;;     (asserts! (< totalInterest totalDeposit) no-liquidity-for-payout)
    ;;     (ok true)
    ;;    )
    ;; )

   
    ;;#[allow(unchecked_data)]
    (define-public (deposit (amount uint) (token <sip10-token>)) 
        (begin 
          (asserts! (> amount u0) less-than-zero-error)
          (asserts! (>= (try! (contract-call? token get-balance tx-sender)) amount) insufficient-token-balance)
               (if (is-eq (var-get totalSupply) u0) 
                   (mint tx-sender amount)
                 (begin 
                   (
                     let (
                        (balance (try! (contract-call? token get-balance (as-contract tx-sender))))
                        (shares (/ (* amount (var-get totalSupply)) balance))
                     )
                     (mint tx-sender shares)
                   )
                 )
            )
            
          (contract-call? token transfer amount tx-sender (as-contract tx-sender) none)
        
        )
    )

    (define-public (payoutTokens (receiver principal) (amount uint))
     (begin 
        (asserts! (is-eq contract-caller .perpsprotocol) not-the-owner-error )
        (try! (as-contract (contract-call? .ptoken transfer amount .vault receiver  none)))
        (ok true)
      )
    
    )



    
    ;;#[allow(unchecked_data)]
    (define-public (withdraw (shares uint) (receipient principal) (token <sip10-token>)) 
        (begin 
          (asserts! (> shares u0) less-than-zero-error)
          ;;(try! (checkLiquidity)) ;;check if we have liquidity
          (
            let (
                (tokenBalance (try! (contract-call? token get-balance (as-contract tx-sender))))
                (amountToTransfer (/ (* shares tokenBalance) (var-get totalSupply)))
             )
            (burn receipient shares)
            (try! (as-contract (contract-call? token transfer amountToTransfer (as-contract tx-sender) receipient none)))
            (print "amount withdrawn from vault")
          )
            
            (ok true) 
          )
          
        )
    
 (define-read-only (getuserDeposit (user principal)) 
    (begin 
      (match (map-get? balances user) userBalance 
      (ok userBalance) 
      (ok u0)
      )
    )
 )


 (define-read-only (getTotalSupply) 
    (ok (var-get totalSupply))
 )


    
                                        