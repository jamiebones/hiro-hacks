
;; title: perpsprotocol
;; version:
;; summary:
;; description:

(define-constant err-unable-to-get-price (err u222))
(define-constant err-position-already-open (err u333))
(define-constant err-less-than-zero-error (err u444))
(define-constant err-position-not-within-leverage (err u555))
(define-constant err-not-valid-user (err u666))
(define-constant no-liquidity-for-payout (err u207))
(define-constant maxLevarge u15)
(define-constant btcSats u100000000)

;; data vars
(define-data-var shortPositionUSD uint u1)
(define-data-var longPositionUSD uint u1)
(define-data-var shortPositionInToken uint u1)
(define-data-var longPositionInToken uint u1)

;;100-000-000 => 1 BTC

;; data maps
;; 1 for short position
;; 2 for long position
(define-map positions principal { buyPrice: uint, 
                                  deposistedCollateral: uint, 
                                  positionType: uint,
                                  amountInUSD: uint,
                                  amountInToken: uint
                                  })  

(define-read-only (isPositionWithInLeverage (positionSize uint) (collacteralSize uint)) 
  (begin
   (asserts! (not (is-eq (/ positionSize collacteralSize) u0)) err-position-not-within-leverage)
   (ok (asserts! (< (/ positionSize collacteralSize) maxLevarge) err-position-not-within-leverage))
  )
  
)

(define-read-only (checkIfPositionIsOpen) 
    (map-get? positions tx-sender)
)

(define-public (calTotalInterest) 
 (begin 
    (
        let (
            (btcPrice  (unwrap! (contract-call? .pythmock readPriceFeed) err-unable-to-get-price))
            (longTokenPosition (var-get longPositionInToken))
            (shortPositonUSD (var-get shortPositionUSD))
            (totalInterest (+ (/ (* btcPrice longTokenPosition) btcSats) shortPositonUSD))
            
            )
         (ok totalInterest)
      )

    )
 )




;; public functions

 (define-public (openPosition (positionSize uint) (collateral uint) (positionType uint)) 
(begin
    (try! (checkLiquidityOfVault))
    (try! (isPositionWithInLeverage positionSize collateral))
    (asserts! ( > positionSize u0) err-less-than-zero-error)
    (asserts! ( > collateral u0) err-less-than-zero-error)
    (asserts! (is-none (checkIfPositionIsOpen)) err-position-already-open)

  (
    let (
        ;;get the price of BTC
        (price  (unwrap! (contract-call? .pythmock readPriceFeed) err-unable-to-get-price))
        (amountInToken (/ (* btcSats positionSize) price))
        
        
    )
    (if (is-eq positionType u1)
      ;;increment a short
      (begin
        (var-set shortPositionUSD (+ (var-get shortPositionUSD) positionSize))
        (var-set shortPositionInToken (+ (var-get shortPositionInToken) amountInToken))
      )
      (begin
        (var-set longPositionUSD  (+ (var-get longPositionUSD) positionSize))
        (var-set longPositionInToken (+ (var-get longPositionInToken) amountInToken))
      )
    )
    ;;increment what we need to do
    ;;write the perpertuals
    (map-set positions tx-sender {buyPrice: price, 
    deposistedCollateral: collateral, 
    positionType: positionType, 
    amountInUSD: positionSize, 
    amountInToken: amountInToken})
    
    (print "investment made")
    (print tx-sender)
    ;;transfer the tokens to the protocol
    (ok (try! (contract-call? .ptoken transfer collateral tx-sender .perpsprotocol none)))
  )
)
)

;;#[allow(unchecked_data)]
(define-public (liquidatePosition (userPrincipal principal))
 (begin 
     (try! (checkLiquidityOfVault))
     (
      let (
            (userPosition (unwrap! (map-get? positions userPrincipal) err-not-valid-user))
            (buyPosition (get buyPrice userPosition))
            (amnountInToken (get amountInToken userPosition))
            (amountInUSD (get amountInUSD userPosition))
            (positionType (get positionType userPosition))
            (collacteral (get deposistedCollateral userPosition))
            
            ;;get current price of BTC
            (currentBTCPrice (unwrap! (contract-call? .pythmock readPriceFeed ) err-unable-to-get-price))
      )

      (if (is-eq positionType u1)
        ;;short
         (
                let (
                    (pnl (/ (* (- currentBTCPrice buyPosition) amnountInToken) btcSats))
                )

                (if (> pnl u0)
                  (begin 
                      ;;(try! (transferToken pnl userPrincipal .vault))
                      ;;(try! (contract-call? .vault payOutTokens userPrincipal pnl))
                      (unwrap! (contract-call? .vault payoutTokens userPrincipal pnl) (err u70))
                      (print "profit made")
                  )
                
                  (
                      let (
                        (remainCollacteral (+ collacteral pnl))
                        (loss (- collacteral remainCollacteral))
                      )
                      ;;transfer the loss from the user collacteral and possibly reduce their position
                       (if ( > (/ amountInUSD remainCollacteral) u15)
                          (begin
                              ;;(try! (transferToken loss .vault (as-contract tx-sender)))
                              (try! (transferToken remainCollacteral userPrincipal (as-contract tx-sender)))
                              ;;delete the position
                              (var-set shortPositionUSD (- (var-get shortPositionUSD) amountInUSD))
                              (var-set shortPositionInToken (- (var-get shortPositionInToken) amnountInToken))
                              (map-delete positions userPrincipal)
                              (print "liquidated")
                          )
                          (begin
                            ;;(try! (transferToken loss .vault (as-contract tx-sender)))
                            (map-set positions userPrincipal (merge userPosition {deposistedCollateral: remainCollacteral}))
                            (print "position reduced")
                          )
                        )
                    )
                )
              
              )


        ;;long
         (
                let (
                    (pnl (/ (* (- buyPosition currentBTCPrice) amnountInToken) btcSats))
                )

                (if (> pnl u0)
                  (begin 
                      ;;(try! (transferToken pnl userPrincipal .vault))
                      (print "long profit made")
                  )
                
                  (
                      let (
                        (remainCollacteral (+ collacteral pnl))
                        (loss (- collacteral remainCollacteral))
                      )
                      ;;transfer the loss from the user collacteral and possibly reduce their position
                       (if ( > (/ amountInUSD remainCollacteral) u15)
                          (begin
                              ;;(try! (transferToken loss .vault (as-contract tx-sender)))
                              (try! (transferToken remainCollacteral userPrincipal (as-contract tx-sender)))
                              ;;delete the position
                              (var-set longPositionUSD (- (var-get longPositionUSD) amountInUSD))
                              (var-set longPositionInToken (- (var-get longPositionInToken) amnountInToken))
                              (map-delete positions userPrincipal)
                              (print "long position liquidated")
                          )
                          (begin
                            ;;(try! (transferToken loss .vault (as-contract tx-sender)))
                            (map-set positions userPrincipal (merge userPosition {deposistedCollateral: remainCollacteral}))
                            (print "position reduced")
                          )
                        )
                    )
                )


                  
              
              )
      
      
      )
      
     )
 
   (ok true)
 )


)

     
    


(define-private (transferToken (amount uint) (receipient principal) (sender principal)) 
  (begin 
    (contract-call? .ptoken transfer amount sender receipient none)
  )
)



(define-read-only (getUserOpenPosition (user principal)) 
  (ok (unwrap! (map-get? positions user) err-not-valid-user))
)


(define-private (calculateUserPosition (user principal) (pnl int) (positionType uint)) 
 (begin 
   
   (ok true)
  )
)

   (define-private (checkLiquidityOfVault)
     (begin 
       (
        let (
           (totalInterest (try! (calTotalInterest )))
           ;;(totalDeposit  (unwrap! (contract-call? .ptoken get-balance .vault) (err u78)))
        )
        ;;(asserts! (< totalInterest totalDeposit) no-liquidity-for-payout)
        (ok true)
       )
     )
    )


 

;; read only functions
;;

;; private functions
;;

;;investing
;;liquidation
;;createPosition
;;liquidatePosition
