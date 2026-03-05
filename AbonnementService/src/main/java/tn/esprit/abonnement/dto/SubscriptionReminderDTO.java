package tn.esprit.abonnement.dto;

import java.time.LocalDateTime;

public class SubscriptionReminderDTO {
    
    private Long userId;
    private String userName;
    private String userEmail;
    private String subscriptionName;
    private LocalDateTime expirationDate;
    private Integer daysUntilExpiration;
    private String reminderType; // EXPIRED, EXPIRING_TODAY, EXPIRING_SOON
    private String message;
    
    public SubscriptionReminderDTO() {
    }
    
    public SubscriptionReminderDTO(Long userId, String userName, String userEmail, 
                                   String subscriptionName, LocalDateTime expirationDate, 
                                   Integer daysUntilExpiration, String reminderType, String message) {
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.subscriptionName = subscriptionName;
        this.expirationDate = expirationDate;
        this.daysUntilExpiration = daysUntilExpiration;
        this.reminderType = reminderType;
        this.message = message;
    }
    
    // Getters and Setters
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    public String getUserEmail() {
        return userEmail;
    }
    
    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }
    
    public String getSubscriptionName() {
        return subscriptionName;
    }
    
    public void setSubscriptionName(String subscriptionName) {
        this.subscriptionName = subscriptionName;
    }
    
    public LocalDateTime getExpirationDate() {
        return expirationDate;
    }
    
    public void setExpirationDate(LocalDateTime expirationDate) {
        this.expirationDate = expirationDate;
    }
    
    public Integer getDaysUntilExpiration() {
        return daysUntilExpiration;
    }
    
    public void setDaysUntilExpiration(Integer daysUntilExpiration) {
        this.daysUntilExpiration = daysUntilExpiration;
    }
    
    public String getReminderType() {
        return reminderType;
    }
    
    public void setReminderType(String reminderType) {
        this.reminderType = reminderType;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    @Override
    public String toString() {
        return "SubscriptionReminderDTO{" +
                "userId=" + userId +
                ", userName='" + userName + '\'' +
                ", subscriptionName='" + subscriptionName + '\'' +
                ", daysUntilExpiration=" + daysUntilExpiration +
                ", reminderType='" + reminderType + '\'' +
                '}';
    }
}
