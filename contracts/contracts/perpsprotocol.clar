
;; title: perpsprotocol
;; version:
;; summary:
;; description:

(define-constant err-unable-to-get-price (err u222))
(define-constant err-position-already-open (err u333))
(define-constant err-less-than-zero-error (err u444))
(define-constant err-position-not-within-leverage (err u555))
(define-constant err-not-valid-user (err u666))
(define-constant maxLevarge u15)
(define-constant btcSats u100000000)

;; data vars
(define-data-var shortPositionUSD uint u0)
(define-data-var longPositionUSD uint u0)
(define-data-var shortPositionInToken uint u0)
(define-data-var longPositionInToken uint u0)

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
            (totalInterest (+ (var-get shortPositionUSD) (* (var-get longPositionInToken) 
        (unwrap! (contract-call? .pythmock readPriceFeed) err-unable-to-get-price))))
      )
        (ok totalInterest)
    )
 )

)


;; public functions

 (define-public (openPosition (positionSize uint) (collateral uint) (positionType uint)) 
(begin
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
    (ok (try! (contract-call? .ptoken transfer collateral tx-sender (as-contract .perpsprotocol) none)))
    

  )
)
)

(define-public (liquidatePosition (userPrincipal principal))
  
  (begin

    (
        let  
        (
            (userPosition (unwrap! (map-get? positions userPrincipal) err-not-valid-user))
            (buyPosition (get buyPrice userPosition))
            (amnountInToken (get amountInToken userPosition))
            (amountInUSD (get amountInUSD userPosition))
            (positionType (get positionType userPosition))
            (collacteral (get deposistedCollateral userPosition))
            ;;get current price of BTC
            (currentBTCPrice (unwrap! (contract-call? .pythmock readPriceFeed ) err-unable-to-get-price))
        
            ;;calculate the PNL
           
           
        )
         (if (is-eq positionType u1)
           ;;calculate the value for shorts
           (begin 
              (
                let (
                    (pnl (/ (* (- currentBTCPrice buyPosition) amnountInToken) btcSats))
                )
                (if (> pnl u0)
                  true    ;;dude has a profit here profit comes from the vault
                 false ;;dude made a loss here loss goes to the vault
                )
                 (ok u1)
              )

             
           )
        
               ;;long position
               (ok u2)
         )
    
     
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
