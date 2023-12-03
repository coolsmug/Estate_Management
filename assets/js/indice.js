
let barThing = document.querySelector(".fa-bars");
let sideBar = document.querySelector(".sidebar");
let logoDiv = document.querySelector(".div-logo");
let menuBarDiv = document.querySelector(".menu-bar");
let searchDiv = document.querySelector(".search");
let anotherMenbar = document.querySelector(".menbar");
let opagueBar = document.querySelector(".opaque");
let timeForClose = document.querySelector(".close");
let hiddeenBar = document.querySelector(".hide-search");
let SearchCover = document.querySelector(".search-cover");
let allDatabase = document.querySelector(".main-container");



barThing.addEventListener('click', () => {
  allDatabase.classList.toggle('main-containerhidden');
  sideBar.classList.toggle('siderbars');
  logoDiv.classList.toggle('div-logotwo');
  searchDiv.classList.toggle('searchtwo');
  menuBarDiv.classList.toggle('menu-bartwo');

});


anotherMenbar.addEventListener('click', () => {
  sideBar.classList.toggle('sidebarthree');
  opagueBar.classList.toggle('opaquetwo');
});

timeForClose.addEventListener('click', () => {
  sideBar.classList.remove('sidebarthree');
  opagueBar.classList.remove('opaquetwo');

});



hiddeenBar.addEventListener('click', () => {
  SearchCover.classList.toggle('open_search');

});


let open = document.getElementsByClassName("list_one");
    
let lastClicked = null;

for(let i = 0; i < open.length; i++) {
  
    open[i].onclick = function() {
        // Toggle the "actives" class on the clicked element
        this.classList.toggle("active");

         // Find the next sibling element
        let hideit = this.nextElementSibling;
        // this.style.color = "black"
      
        // Close the last clicked element if it exists and is not the current element
        if (lastClicked && lastClicked !== this) {
            lastClicked.nextElementSibling.style.maxHeight = null;
            lastClicked.nextElementSibling.style.opacity = '0';
            lastClicked.classList.remove("active");
            lastClicked.style.borderRadius = "10px 10px 10px 10px";
            lastClicked.style.color = "black";
        }
      
        // Set the maxHeight of the clicked element's next sibling
        if (hideit.style.maxHeight) {
            hideit.style.maxHeight = null;
            hideit.style.opacity = '0';
            this.style.borderRadius = "10px 10px 10px 10px";
            this.style.color = "black";
           
        } else {
            hideit.style.maxHeight = hideit.scrollHeight + "px";
            hideit.style.opacity = '1';
            hideit.style.borderRadius = "0 0 10px 10px";
            this.style.borderRadius = "10px 10px 0 0";
            this.style.color = "white";
        }

        
        // Set the last clicked element to the current element
        lastClicked = this;
        
    }
}

// Get the table rows
// const rows = document.querySelectorAll("#myTable tbody tr");

// // Loop through each row and add a click event listener
// rows.forEach(row => {
//   row.addEventListener("click", () => {
//     // Remove active class from all rows
//     rows.forEach(row => row.classList.remove("active"));
//     // Add active class to clicked row
//     row.classList.add("active");
//   });
// });

// // Get the buttons
// const deleteBtns = document.querySelectorAll(".delete");
// const viewBtns = document.querySelectorAll(".view");
// const editBtns = document.querySelectorAll(".edit");

// // Loop through each button and add a click event listener
// deleteBtns.forEach(btn => {
//   btn.addEventListener("click", () => {
//     alert("Delete button clicked");
//   });
// });

// viewBtns.forEach(btn => {
//   btn.addEventListener("click", () => {
//     alert("View button clicked");
//   });
// });

// editBtns.forEach(btn => {
//   btn.addEventListener("click", () => {
//     alert("Edit button clicked");
//   });
// });

// profile and logOut
const hideSet = document.querySelector('.hide_profile');
const logoutSpace = document.querySelector('.logout_space');

hideSet.addEventListener('click', () => {
  logoutSpace.classList.toggle('hiddein');
});


var x, i, j, l, ll, selElmnt, a, b, c;
/*look for any elements with the class "custom-select":*/
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  ll = selElmnt.length;
  /*for each element, create a new DIV that will act as the selected item:*/
  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);
  /*for each element, create a new DIV that will contain the option list:*/
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");
  for (j = 1; j < ll; j++) {
    /*for each option in the original select element,
    create a new DIV that will act as an option item:*/
    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function(e) {
        /*when an item is clicked, update the original select box,
        and the selected item:*/
        var y, i, k, s, h, sl, yl;
        s = this.parentNode.parentNode.getElementsByTagName("select")[0];
        sl = s.length;
        h = this.parentNode.previousSibling;
        for (i = 0; i < sl; i++) {
          if (s.options[i].innerHTML == this.innerHTML) {
            s.selectedIndex = i;
            h.innerHTML = this.innerHTML;
            y = this.parentNode.getElementsByClassName("same-as-selected");
            yl = y.length;
            for (k = 0; k < yl; k++) {
              y[k].removeAttribute("class");
            }
            this.setAttribute("class", "same-as-selected");
            break;
          }
        }
        h.click();
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  a.addEventListener("click", function(e) {
      /*when the select box is clicked, close any other select boxes,
      and open/close the current select box:*/
      e.stopPropagation();
      closeAllSelect(this);
      this.nextSibling.classList.toggle("select-hide");
      this.classList.toggle("select-arrow-active");
    });
}
function closeAllSelect(elmnt) {
  /*a function that will close all select boxes in the document,
  except the current select box:*/
  var x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}
/*if the user clicks anywhere outside the select box,
then close all select boxes:*/
document.addEventListener("click", closeAllSelect);


//Ajax for updates
$("#propertyOnly").submit(function (param) {
  param.preventDefault();

  let unindexed_arraysss = $(this).serializeArray();
  let data = {}

  $.map(unindexed_arraysss, function (n, i) {
    data[ n[ "name" ]] = n[ "value" ]
  }); 
  console.log(data);

  var requests = {
    "url" : `/admin/edit-property/${data.id}`,
    "method" : "POST",
    "data" : data,
  };

    $.ajax(requests).done(function(responses) {
    alert(" Data Updated Successfully!")
    location.reload()
    console.log("Current class Updated Successfully!")
  });
});

$("#landOnly").submit(function (param) {
  param.preventDefault();

  let unindexed_arraysss = $(this).serializeArray();
  let data = {}

  $.map(unindexed_arraysss, function (n, i) {
    data[ n[ "name" ]] = n[ "value" ]
  }); 
  console.log(data);

  var requests = {
    "url" : `/admin/edit-land/${data.id}`,
    "method" : "POST",
    "data" : data,
  };

    $.ajax(requests).done(function(responses) {
    alert(" Data Updated Successfully!")
    location.reload()
    console.log("Current class Updated Successfully!")
  });
});

$("#Blog").submit(function (param) {
  param.preventDefault();

  let unindexed_arraysss = $(this).serializeArray();
  let data = {}

  $.map(unindexed_arraysss, function (n, i) {
    data[ n[ "name" ]] = n[ "value" ]
  }); 
  console.log(data);

  var requests = {
    "url" : `/admin/edit-blog/${data.id}`,
    "method" : "POST",
    "data" : data,
  };

    $.ajax(requests).done(function(responses) {
    alert(" Data Updated Successfully!")
    location.reload()
    console.log("Data Updated Successfully!")
  });
});

$("#Admin").submit(function (param) {
  param.preventDefault();

  let unindexed_arraysss = $(this).serializeArray();
  let data = {}

  $.map(unindexed_arraysss, function (n, i) {
    data[ n[ "name" ]] = n[ "value" ]
  }); 
  console.log(data);

  var requests = {
    "url" : `/admin/edit-admin/${data.id}`,
    "method" : "POST",
    "data" : data,
  };

    $.ajax(requests).done(function(responses) {
    alert(" Data Updated Successfully!")
    location.reload()
    console.log("Data Updated Successfully!")
  });
});


$("#Staff").submit(function (param) {
  param.preventDefault();

  let unindexed_arraysss = $(this).serializeArray();
  let data = {}

  $.map(unindexed_arraysss, function (n, i) {
    data[ n[ "name" ]] = n[ "value" ]
  }); 
  console.log(data);

  var requests = {
    "url" : `/admin/edit-staff/${data.id}`,
    "method" : "POST",
    "data" : data,
  };

    $.ajax(requests).done(function(responses) {
    alert(" Data Updated Successfully!")
    location.reload()
    console.log("Data Updated Successfully!")
  });
});

$("#Service").submit(function (param) {
  param.preventDefault();

  let unindexed_arraysss = $(this).serializeArray();
  let data = {}

  $.map(unindexed_arraysss, function (n, i) {
    data[ n[ "name" ]] = n[ "value" ]
  }); 
  console.log(data);

  var requests = {
    "url" : `/admin/edit-service/${data.id}`,
    "method" : "POST",
    "data" : data,
  };

    $.ajax(requests).done(function(responses) {
    alert(" Data Updated Successfully!")
    location.reload()
    console.log("Data Updated Successfully!")
  });
});


$("#About").submit(function (param) {
  param.preventDefault();

  let unindexed_arraysss = $(this).serializeArray();
  let data = {}

  $.map(unindexed_arraysss, function (n, i) {
    data[ n[ "name" ]] = n[ "value" ]
  }); 
  console.log(data);

  var requests = {
    "url" : `/admin/edit-infor/${data.id}`,
    "method" : "POST",
    "data" : data,
  };

    $.ajax(requests).done(function(responses) {
    alert(" Data Updated Successfully!")
    location.reload()
    console.log("Data Updated Successfully!")
  });
});

$("#Admin").submit(function (param) {
  param.preventDefault();

  let unindexed_arraysss = $(this).serializeArray();
  let data = {}

  $.map(unindexed_arraysss, function (n, i) {
    data[ n[ "name" ]] = n[ "value" ]
  }); 
  console.log(data);

  var requests = {
    "url" : `/admin/edit-admin/${data.id}`,
    "method" : "POST",
    "data" : data,
  };

    $.ajax(requests).done(function(responses) {
    alert(" Data Updated Successfully!")
    location.reload()
    console.log("Data Updated Successfully!")
  });
});

$("#career").submit(function (param) {
  param.preventDefault();

  let unindexed_arraysss = $(this).serializeArray();
  let data = {}

  $.map(unindexed_arraysss, function (n, i) {
    data[ n[ "name" ]] = n[ "value" ]
  }); 
  console.log(data);

  var requests = {
    "url" : `/admin/edit-career/${data.id}`,
    "method" : "POST",
    "data" : data,
  };

    $.ajax(requests).done(function(responses) {
    alert(" Data Updated Successfully!")
    location.reload()
    console.log("Data Updated Successfully!")
  });
});

//-----------------------------delete--------------------------------
$(function() {
  $('a.delete_contact').click(function(e) {
    e.preventDefault(); // Prevent the default behavior of the anchor tag
    var url = $(this).attr('href'); // Get the URL to send the DELETE request to
    var id = $(this).data('id'); // Get the ID of the resource to be deleted from a data-* attribute
    var row = $(this).closest('tr'); // Assuming you are working with a table row, adjust this based on your HTML structure

    if (confirm('Are you sure you want to delete this contact?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        data: { id: id },
        success: function(result) {
          alert('Data deleted successfully!');
          row.remove(); // Remove the deleted row from the DOM
        },
        error: function(xhr, status, error) {
          alert('Error deleting Data: ' + error);
        }
      });
    }
  });
});


$(function() {
  $('a.deleted_one').click(function(e) {
    e.preventDefault(); // Prevent the default behavior of the anchor tag
    var url = $(this).attr('href'); // Get the URL to send the DELETE request to
    var id = $(this).data('id'); // Get the ID of the resource to be deleted from a data-* attribute
    var row = $(this).closest('tr'); // Assuming you are working with a table row, adjust this based on your HTML structure

    if (confirm('Are you sure you want to delete this data?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        data: { id: id },
        success: function(result) {
          alert('Data deleted successfully!');
          row.remove(); // Remove the deleted row from the DOM
        },
        error: function(xhr, status, error) {
          alert('Error deleting Data: ' + error);
        }
      });
    }
  });
});

$(function() {
  $('a.delete_land').click(function(e) {
    e.preventDefault(); // Prevent the default behavior of the anchor tag
    var url = $(this).attr('href'); // Get the URL to send the DELETE request to
    var id = $(this).data('id'); // Get the ID of the resource to be deleted from a data-* attribute
    var row = $(this).closest('tr'); // Assuming you are working with a table row, adjust this based on your HTML structure

    if (confirm('Are you sure you want to delete this data?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        data: { id: id },
        success: function(result) {
          alert('Data deleted successfully!');
          row.remove(); // Remove the deleted row from the DOM
        },
        error: function(xhr, status, error) {
          alert('Error deleting Data: ' + error);
        }
      });
    }
  });
});



$(function() {
  $('a.delete_blog').click(function(e) {
    e.preventDefault(); // Prevent the default behavior of the anchor tag
    var url = $(this).attr('href'); // Get the URL to send the DELETE request to
    var id = $(this).data('id'); // Get the ID of the resource to be deleted from a data-* attribute
    var row = $(this).closest('tr'); // Assuming you are working with a table row, adjust this based on your HTML structure

    if (confirm('Are you sure you want to delete this data?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        data: { id: id },
        success: function(result) {
          alert('Data deleted successfully!');
          row.remove(); // Remove the deleted row from the DOM
        },
        error: function(xhr, status, error) {
          alert('Error deleting Data: ' + error);
        }
      });
    }
  });
});


$(function() {
  $('a.delete_admin').click(function(e) {
    e.preventDefault(); // Prevent the default behavior of the anchor tag
    var url = $(this).attr('href'); // Get the URL to send the DELETE request to
    var id = $(this).data('id'); // Get the ID of the resource to be deleted from a data-* attribute
    var row = $(this).closest('tr'); // Assuming you are working with a table row, adjust this based on your HTML structure

    if (confirm('Are you sure you want to delete this data?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        data: { id: id },
        success: function(result) {
          alert('Data deleted successfully!');
          row.remove(); // Remove the deleted row from the DOM
        },
        error: function(xhr, status, error) {
          alert('Error deleting Data: ' + error);
        }
      });
    }
  });
});

$(function() {
  $('a.delete_staff').click(function(e) {
    e.preventDefault(); // Prevent the default behavior of the anchor tag
    var url = $(this).attr('href'); // Get the URL to send the DELETE request to
    var id = $(this).data('id'); // Get the ID of the resource to be deleted from a data-* attribute
    var row = $(this).closest('tr'); // Assuming you are working with a table row, adjust this based on your HTML structure

    if (confirm('Are you sure you want to delete this data?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        data: { id: id },
        success: function(result) {
          alert('Data deleted successfully!');
          row.remove(); // Remove the deleted row from the DOM
        },
        error: function(xhr, status, error) {
          alert('Error deleting Data: ' + error);
        }
      });
    }
  });
});

$(function() {
  $('a.delete_career').click(function(e) {
    e.preventDefault(); // Prevent the default behavior of the anchor tag
    var url = $(this).attr('href'); // Get the URL to send the DELETE request to
    var id = $(this).data('id'); // Get the ID of the resource to be deleted from a data-* attribute
    var row = $(this).closest('tr'); // Assuming you are working with a table row, adjust this based on your HTML structure

    if (confirm('Are you sure you want to delete this data?')) {
      $.ajax({
        url: url,
        type: 'DELETE',
        data: { id: id },
        success: function(result) {
          alert('Data deleted successfully!');
          row.remove(); // Remove the deleted row from the DOM
        },
        error: function(xhr, status, error) {
          alert('Error deleting Data: ' + error);
        }
      });
    }
  });
});




//Switch Button------------------------------------------//


//------------------------------staffSwitch------------------------//

$(document).ready(function() {
  let isProcessing = false;

  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  const debouncedClickHandler = debounce(function() {
    if (!isProcessing) {
      const switchId = $(this).find('input').data('user-id');
      const updatedStatus = $(this).find('input').is(':checked');

      isProcessing = true;

      $.ajax({
        url: `/admin/staff-status/${switchId}`,
        type: 'PATCH',
        data: { status: updatedStatus },
        success: function(data) {
          // Update the switch status immediately without a page reload
          $(this).find('input').prop('checked', updatedStatus);
          alert('Status changed successfully');
        },
        error: function(error) {
          console.error(error);
        },
        complete: function() {
          isProcessing = false;
        }
      });
    }
  }, 500); // Adjust the debounce time as needed

  $('.staff_swith').click(debouncedClickHandler);
});



//------------------------------end staffSwitch------------------------//


//------------------------------AdminSwitch------------------------//
$(document).ready(function() {
  let isProcessing = false;

  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  const debouncedClickHandler = debounce(function() {
    if (!isProcessing) {
      const switchId = $(this).find('input').data('user-id');
      const updatedStatus = $(this).find('input').is(':checked');

      isProcessing = true;

      $.ajax({
        url: `/admin/admin-status/${switchId}`,
        type: 'PATCH',
        data: { status: updatedStatus },
        success: function(data) {
          // Update the switch status immediately without a page reload
          $(this).find('input').prop('checked', updatedStatus);
          alert('Status changed successfully');
        },
        error: function(error) {
          console.error(error);
        },
        complete: function() {
          isProcessing = false;
        }
      });
    }
  }, 500); // Adjust the debounce time as needed

  $('.switch').click(debouncedClickHandler);
});


//------------------------end Admin switch----------------------//



//------------------------------careerSwitch------------------------//
$(document).ready(function() {
  let isProcessing = false;

  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  const debouncedClickHandler = debounce(function() {
    if (!isProcessing) {
      const switchId = $(this).find('input').data('user-id');
      const updatedStatus = $(this).find('input').is(':checked');

      isProcessing = true;

      $.ajax({
        url: `/admin/career-status/${switchId}`,
        type: 'PATCH',
        data: { status: updatedStatus },
        success: function(data) {
          // Update the switch status immediately without a page reload
          $(this).find('input').prop('checked', updatedStatus);
          alert('Status changed successfully');
        },
        error: function(error) {
          console.error(error);
        },
        complete: function() {
          isProcessing = false;
        }
      });
    }
  }, 500); // Adjust the debounce time as needed

  $('.career_swith').click(debouncedClickHandler);
});


//------------------------end carer switch----------------------//



//------------------------------ManagementSwitch------------------------//

$(document).ready(function() {
  let isProcessing = false;

  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  const debouncedClickHandlers = debounce(function() {
    if (!isProcessing) {
      const switchId = $(this).find('input').data('user-id');
      const updatedStatus = $(this).find('input').is(':checked');

      isProcessing = true;

      $.ajax({
        url: `/admin/managing-status/${switchId}`,
        type: 'PATCH',
        data: { managingStatus: updatedStatus },
        success: function(data) {
          // Update the switch status immediately without a page reload
          $(this).find('input').prop('checked', updatedStatus);
          alert('Status changed successfully');
        },
        error: function(error) {
          console.error(error);
        },
        complete: function() {
          isProcessing = false;
        }
      });
    }
  }, 500); // Adjust the debounce time as needed

  $('.staff_management').click(debouncedClickHandlers);
});



//------------------------------end ManangementSwitch------------------------//

