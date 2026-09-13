package com.aiplacement.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "feature_entitlements", indexes = {
        @Index(name = "idx_entitlement_user", columnList = "user_id"),
        @Index(name = "idx_entitlement_feature", columnList = "user_id, feature_key"),
        @Index(name = "idx_entitlement_user_status", columnList = "user_id, status, expiry_date"),
        @Index(name = "idx_entitlement_expiry", columnList = "expiry_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeatureEntitlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "feature_key", nullable = false, length = 50)
    private String featureKey;

    @Column(name = "feature_name", nullable = false)
    private String featureName;

    @Column(name = "purchased_credits", nullable = false)
    private Double purchasedCredits;

    @Column(name = "used_credits", nullable = false)
    @Builder.Default
    private Double usedCredits = 0.0;

    @Column(name = "remaining_credits", nullable = false)
    private Double remainingCredits;

    @Column(name = "unit", nullable = false, length = 30)
    private String unit;

    @Column(name = "purchase_date", nullable = false)
    private LocalDateTime purchaseDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    @Column(name = "razorpay_order_id")
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, EXPIRED, EXHAUSTED
}
