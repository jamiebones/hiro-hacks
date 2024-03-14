(define-constant contractOwner tx-sender)
(define-constant less-than-zero (err u100))
(define-constant not-owner (err u101))
(define-data-var btcPrice uint u60000000000) ;;6 digit decimal



(define-public (readPriceFeed)
 (begin
    (if (is-eq (mod block-height u2) u0) 
         (var-set btcPrice (+ u100000000 (var-get btcPrice)))
         (var-set btcPrice (- (var-get btcPrice) u50000000))
    )
  (ok (var-get btcPrice))
 )
)

(define-public (changePrice (price uint))
 (begin
   (asserts! (is-eq contractOwner tx-sender) not-owner)
   (asserts! (> (- (var-get btcPrice) price) u0 ) less-than-zero)
   (ok (var-get btcPrice))
 )

)

