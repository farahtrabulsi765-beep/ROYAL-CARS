$(document).ready(function () {

  

  $("#exit-link").on("click", function (e) {
    e.preventDefault();
    window.onbeforeunload = null; 
    window.close();
    setTimeout(function () {
        window.location.replace("about:blank");
    }, 100);
});
  
  $(".show-details").on("click", function () {
    var id = $(this).val();
    $("#details-" + id).fadeToggle(300);
  });

  
  $(".butstyle").on("click", function () {
    if ($(".choosecar:checked").length == 0) {
      alert("يرجى اختيار سيارة واحدة على الأقل.");
      return;
    }
    $("#details").show();
  });

  
  $("#details").on("submit", function (e) {
    e.preventDefault();
    var name = $("form input[type='text']").eq(0).val().trim();
    var nationalNum = $("form input[type='text']").eq(1).val().trim();
    var startDate = $("form input[type='date']").eq(0).val();
    var endDate = $("form input[type='date']").eq(1).val();
    var mobile = $("form input[type='text']").eq(2).val().trim();
    var email = $("form input[type='email']").eq(0).val().trim();

    var errors = [];

    if ($(".choosecar:checked").length == 0) {
      errors.push("يرجى اختيار سيارة واحدة على الأقل.");
    }

    if (name !== "") {
      var nameError = checkName(name);
      if (nameError !== "") errors.push(nameError);
    }

    var nationalError = checkNationalNumber(nationalNum);
    if (nationalError !== "") errors.push(nationalError);

    var datesError = checkDates(startDate, endDate);
    if (datesError !== "") errors.push(datesError);

    if (mobile !== "") {
      var mobileError = checkMobile(mobile);
      if (mobileError !== "") errors.push(mobileError);
    }

    if (email !== "") {
      var emailError = checkEmail(email);
      if (emailError !== "") errors.push(emailError);
    }

    if (errors.length > 0) {
      alert("يرجى تصحيح الأخطاء التالية:\n\n" + errors.join("\n"));
      return false;
    }

    var msg = "تم التحقق بنجاح!\n\nالسيارات المختارة:\n";
    var days = 0;
    var total = 0;
    var discount = 0;
    var finalTotal = 0;

    $(".choosecar:checked").each(function () {
      var row = $(this).closest("tr");
      var model = row.find("td").eq(2).text().trim();
      var dailyPrice = parseInt(row.find("td").eq(4).text().replace(/[^\d]/g, ""), 10);
      var result = calculateRent(startDate, endDate, dailyPrice);
      days = result.totalDays;
      total += result.totalPrice;
      discount += result.discountAmount;
      finalTotal += result.finalTotal;
      msg += "- " + model + ": " + result.totalDays + " يوم\n";
    });

    msg += "\nعدد أيام التأجير: " + days + " أيام (لكل سيارة)" +
           "\nالمجموع: " + total + " ل.س" +
           "\nقيمة الخصم: " + discount + " ل.س" +
           "\nالمبلغ الإجمالي النهائي: " + finalTotal + " ل.س";
    alert(msg);
    return false;
  });

});

function isDigits(str) {
return /^\d+$/.test(str);
}

function checkName(name) {
  if (name == "") {
      return "الاسم الكامل لمقدم الطلب مطلوب.";
  }

  for (var i = 0; i < name.length; i++) {
      var code = name.charCodeAt(i);
      var isArabic = (code >= 1569 && code <= 1610);
      
      if (!isArabic && name.charAt(i) != " ") {
          return "يجب أن يحتوي الاسم على أحرف هجائية عربية فقط.";
      }
  }

  return "";
} 

function checkNationalNumber(num) {
  if (num === "") {
      return ".الرقم الوطني إلزامي و مطلوب";
  }
  if (num.length != 11 || !isDigits(num)) {
      return "يجب أن يتكون الرقم الوطني من 11 خانة رقمية";
  }
  var gov = parseInt(num.substring(0, 2), 10);
  if (gov < 1 || gov > 14) {
      return "أول خانتين بالرقم الوطني يجب أن تكون بين 01 و 14.";
  }
  return "";     
}   


function checkDates(startDate, endDate) {
  if (startDate == "" || endDate == "") {
      return "تاريخ البداية وتاريخ النهاية حقول مطلوبة.";
  }

  var matchStart = /^(\d{4})-(\d{2})-(\d{2})$/.exec(startDate);
  if (matchStart == null) {
      return "صيغة تاريخ البداية غير صحيحة، يجب أن تكون yyyy-mm-dd";
  }

  var matchEnd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(endDate);
  if (matchEnd == null) {
      return "صيغة تاريخ النهاية غير صحيحة، يجب أن تكون yyyy-mm-dd";
  }

  var start = new Date(startDate);
  var end = new Date(endDate);

  if (end <= start) {
      return "يجب أن يكون تاريخ نهاية التأجير لاحقاً لتاريخ البداية.";
  }

  return "";
} 

function calculateRent(startDateStr, endDateStr, dailyPrice) {
  var start = new Date(startDateStr);
  var end = new Date(endDateStr);

  var timeDiff = end.getTime() - start.getTime();
  var days = timeDiff / (1000 * 3600 * 24); 

  var totalPrice = days * dailyPrice;
  var discount = 0;

  if (days > 10) {
      discount = totalPrice * 0.05;
  }

  var finalPrice = totalPrice - discount;

  return {
      totalDays: days,
      totalPrice: totalPrice,
      discountAmount: discount,
      finalTotal: finalPrice
  };
} 

function checkMobile(mobile) {
  if (mobile == "") {
      return "رقم الموبايل مطلوب.";
  }

  if (mobile.length != 10 || !isDigits(mobile)) {
      return "يجب أن يتكون رقم الموبايل من 10 أرقام تماماً.";
  }

  var prefix = mobile.substring(0, 3);
  var isSyriatel = (prefix == "093" || prefix == "098" || prefix == "099");
  var isMtn = (prefix == "094" || prefix == "095" || prefix == "096");

  if (!isSyriatel && !isMtn) {
      return "يجب أن يكون الرقم تابعاً لشبكة Syriatel أو MTN (يبدأ بـ 093, 094, 095, 096, 098, 099).";
  }

  return "";
} 

function checkEmail(email) {
  if (email === "") {
      return "البريد الإلكتروني مطلوب.";
  }
  if (email.indexOf("@") === -1 || email.indexOf(".") === -1) {
      return "صيغة البريد الإلكتروني غير صحيحة، يجب أن يحتوي على @ ونقطة.";
  }
  return "";
}
