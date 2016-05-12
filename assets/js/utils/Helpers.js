import Firebase from 'firebase';
var loremIpsum = require('lorem-ipsum')

let Helpers = {
  createMedia: function(campaignId) {
    var firebaseRef = new Firebase(this.firebaseUrl());
    var authData = firebaseRef.getAuth();
    var timestamp = new Date().getTime();
    var newMediaRef = firebaseRef.child("media").push({
      campaign: campaignId,
      caption: this.dummyText(),
      created_at: timestamp,
      type: "image",
      uri: this.dummyImageUrl(timestamp),
      user: authData.uid,
    });
    var mediaId = newMediaRef.key();
    firebaseRef.child("users").child(authData.uid).child("campaigns").child(campaignId).child("media").child(mediaId).set(true);
    return mediaId;
  },
  createReportback: function(signupId, totalQuantityEntered, quote) {
    var firebaseRef = new Firebase(this.firebaseUrl());
    var authData = firebaseRef.getAuth();
    var timestamp = new Date().getTime();
    var newReportbackRef = firebaseRef.child("reportbacks").push({
      quantity: totalQuantityEntered,
      quote: quote,
      signup: signupId,
      status: "pending",
      submitted_at: timestamp,
      user: authData.uid,
    });
    var reportbackId = newReportbackRef.key();
    firebaseRef.child("users/" + authData.uid + "/reportbacks/" + reportbackId).set(true);
    firebaseRef.child("signups").child(signupId).child("reportbacks").child(reportbackId).set(true);
    return reportbackId;
  },
  createReview: function(campaignId, reportbackId, status, mediaId, gallery) {
    var firebaseRef = new Firebase(this.firebaseUrl());
    var authData = firebaseRef.getAuth();
    var timestamp = new Date().getTime();
    // Create a new review
    var newReviewRef = firebaseRef.child("reviews").push({
      reportback: reportbackId,
      created_at: timestamp,
      status: "status",
      user: authData.uid,
    });
    var reviewId = newReviewRef.key();
    // Join it to the Reportback
    firebaseRef.child("reportbacks/" + reportbackId + "/reviews/" + reviewId).set(true);
    // Join it to the Reviewer
    firebaseRef.child("users/" + authData.uid + "/reviews/" + reviewId).set(true);
    // Update the Reportback status
    firebaseRef.child("reportbacks/" + reportbackId).update({
      reviewed_at: new Date().getTime(),
      status: status
    });
    // Update the Campaign queues
    var campaignReportbacksRef = firebaseRef.child("campaigns/" + campaignId + "/reportbacks");
    campaignReportbacksRef.child("pending").child(reportbackId).set(null);
    campaignReportbacksRef.child("reviewed").child(reportbackId).set(true);
    // Post to Campaign gallery
    var galleryUrl = "campaigns/" + campaignId + "/media/gallery/" + mediaId;
    if (!gallery) {
      gallery = null;
    }
    firebaseRef.child(galleryUrl).set(gallery);
  },
  createSignup: function(campaignId) {
    var firebaseRef = new Firebase(this.firebaseUrl());
    var authData = firebaseRef.getAuth();
    var timestamp = new Date().getTime();

    var newSignupRef = firebaseRef.child("signups").push({
      campaign: campaignId,
      submitted_at: timestamp,
      user: authData.uid,
    });
    var signupId = newSignupRef.key();
    // Join it to authenticated user
    firebaseRef.child("users/" + authData.uid + "/campaigns/" + campaignId + "/signups/" + signupId).set(true);
  },
  dummyImageUrl: function(timestamp) {
    var categories = ["abstract", "animals", "business", "cats", "city", "food", "nightlife", "people", "nature", "sports", "technics", "transport"];
    var randomCategory = categories[Math.round(Math.random()*categories.length)];
    return "http://lorempixel.com/400/400/" + randomCategory + "/?id=" + timestamp;
  },
  dummyText: function() {
    return loremIpsum({
      count: 1,
      units: 'sentences',
    });
  },
  firebaseUrl: function() {
    return "https://sweltering-torch-5166.firebaseio.com";
  },
  formatTimestamp: function(timestamp) {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var date = new Date(timestamp);
    var prettyDate = months[date.getUTCMonth()] + ' ' + date.getUTCDate() + ', ' + date.getUTCFullYear() + ' ' + date.toLocaleTimeString();
    return prettyDate;
  },
  isValidKey(keyName) {
    return !(keyName == ".key" || keyName == ".value");
  },
  trimText: function(string, length) {
    return string.length > length ? string.substring(0, length - 3) + "..." : string.substring(0, length)
  }
}

export default Helpers;
