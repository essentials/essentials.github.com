var commandsTable,
	permissionsTable,
	isEditing = false,
	baseUrl = '';
	rid;

$.fn.dataTableExt.oApi.fnReloadAjax = function ( oSettings, sNewSource, fnCallback, target )
{
    if ( typeof sNewSource != 'undefined' && sNewSource != null ) {
        oSettings.sAjaxSource = sNewSource;
    }

    // Server-side processing should just call fnDraw
    if ( oSettings.oFeatures.bServerSide ) {
        this.fnDraw();
        return;
    }

    this.oApi._fnProcessingDisplay( oSettings, true );
    var that = this;
    var iStart = oSettings._iDisplayStart;
    var aData = [];

    this.oApi._fnServerParams( oSettings, aData );

    oSettings.fnServerData.call( oSettings.oInstance, oSettings.sAjaxSource, aData, function(json) {
        /* Clear the old information from the table */
        that.oApi._fnClearTable( oSettings );

        /* Got the data - add it to the table */
        var aData =  (oSettings.sAjaxDataProp !== "") ?
            that.oApi._fnGetObjectDataFn( oSettings.sAjaxDataProp )( json ) : json;

        for ( var i=0 ; i<aData.length ; i++ )
        {
            that.oApi._fnAddData( oSettings, aData[i] );
        }

        oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();

        if ( typeof bStandingRedraw != 'undefined' && bStandingRedraw === true )
        {
            oSettings._iDisplayStart = iStart;
            that.fnDraw( false );
        }
        else
        {
            that.fnDraw();
        }

        that.oApi._fnProcessingDisplay( oSettings, false );

        /* Callback user function - for event handlers etc */
        if ( typeof fnCallback == 'function' && fnCallback != null )
        {
            fnCallback( target );
        }
    }, oSettings );
};

function addCommandDetails(nTr, tid) {
	$.ajax({
		url		: baseUrl+'docs/fetch/command_details/'+rid+'/'+tid,
		type	: 'get',
		dataType: 'json',
		success	: function(data) {
			if(data.status == false) {
				alert(data.message);
			}
			else {
                var rowClass = 'command-details-row';
				var row = commandsTable.fnOpen(nTr, data.permissions, rowClass);
				$('.button').button();
                makeEditable('#commands > tbody > tr:eq('+(row.rowIndex-1)+')');
			}
		}
	});
}

function toggleCommandDetails(nTr) {
	var img = $('img.details-img', nTr);
	if(img.length == 0) {
		return;
	}

	if($(img).attr('src').match('round_remove')) {
		// This row is already open...close it
		$(img).attr('src', baseUrl+'assets/img/round_add.png');
		commandsTable.fnClose(nTr);
	}
	else {
		// Open the row
		var aData = commandsTable.fnGetData(nTr);
		$(img).attr('src', baseUrl+'assets/img/round_remove.png');
		addCommandDetails(nTr, aData[0]);
	}
}

function addNewPermission(table, tid) {
	var insert = '<tr>';
	insert += '<td class="center">'+(tid == 0 ? '<img src="'+baseUrl+'assets/img/delete.png" class="delete-perm">' : '<input type="hidden" name="tid" value="'+tid+'" />')+'</td>';
	insert += '<td><input style="width: 300px" type="text" name="perm[]" placeholder="essentials.permission" /></td>';
	insert += '<td><input style="width: 500px" type="text" name="pdesc[]" value="Allow access to the /command command." placeholder="Description" />'+
				(tid == 'x' ? '' : '</td><td><button class="save-perm button">Save</button>&nbsp;<button class="cancel-perm button">Cancel</button>')+
				'</td>'+
				'</tr>';

	return $(insert).appendTo(table);
}

function updateMsg(e, msg) {
	$(e).text(msg).
		addClass('ui-state-highlight');
	setTimeout(function() {
		e.removeClass('ui-state-highlight', 1500);
	}, 500);
}

function checkIsSet(o, n, e) {
	if(o.val().length == 0) {
		o.addClass('ui-state-error');
		updateMsg(e, n + ' cannot be empty.');
		return false;
	}

	return true;
}

function refreshReleaseSelector(data) {
    $('#release_selector').html(data);
    bindReleaseSelector();
}

function triggerRefresh(element, table) {
    if($(element).val() == '0') {
        if($(element).is('select')) {
            $('#release_selector select').val(rid);
        }
        return false;
    }

    rid = $(element).val();

    if($(element).is('select')) {
        $('#release_selector input:checked').removeAttr('checked');
    }
    else {
        $('#release_selector select').val('');
    }

    $.ajax({
        url: baseUrl+'docs/fetch/release/'+rid,
        dataType: 'json',
        success: function(data) {
            if(data.status === false) {
                alert('Unable to fetch the release details. Please try again.');
                return;
            }

            $('#release-details').html(data.details);
        }
    });

    $('#'+table).dataTable().fnReloadAjax(baseUrl+'docs/fetch/'+table+'/'+rid, makeEditable);
}

function bindReleaseSelector() {
    $('#release_selector input, #release_selector select').on('change', function() {
        var table = $('#commands').length ? 'commands' : 'permissions';
        triggerRefresh(this, table);
    });
}

function makeEditable(parent) {
    if(jQuery.editable === undefined) {
        return;
    }
    parent = (typeof parent === 'undefined') ? '' : parent+' ';

    $(parent+'.editable').editable(baseUrl+'docs/update', {
        event       : 'dblclick',
        placeholder	: '<em>Double-click to edit</em>',
        tooltip		: 'Double-click to edit',
        data		: function(value, settings) {
            isEditing = true;
            return value.replace(/&lt;\/?pre&gt;/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        },
        submitdata  : { rid: rid },
        callback	: function(value, settings) {
            isEditing = false;
        }
    });

	$(parent + '.editarea').editable(baseUrl+'docs/update', {
		event		: 'dblclick',
		type		: 'textarea',
		rows		: 3,
		cols		: 80,
		submit		: 'ok',
		placeholder	: '<em>Double-click to edit</em>',
		tooltip		: 'Double-click to edit',
		data		: function(value, settings) {
			isEditing = true;
			return value.replace(/<\/?pre>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\<br ?\/?\>/g, "\r");
		},
		submitdata  : { rid: rid },
		callback	: function(value, settings) {
			isEditing = false;
		}
	});

    $(parent + '.editselect').editable(baseUrl+'docs/update', {
        type: 'select',
        loadurl: baseUrl+'docs/fetch/states',
        event: 'dblclick',
        placeholder: '<em>Double-click to edit</em>',
        tooltip: 'Double-click to edit',
        submit: 'ok',
        data : function(value, settings) {
            idEditing = true;
            return value;
        },
        submitdata: { rid : rid },
        callback: function(value, settings) {
            isEditing = false;
            $.ajax({
                url: baseUrl+'docs/fetch/release_selector/'+rid,
                dataType: 'json',
                success: function(data) {
                    refreshReleaseSelector(data.selector);
                }
            });
        }
    });
}

function bindPermissionFormClicks(buttons) {
    for(var index = 0; index < buttons.length; index++) {
        var button = $(buttons[index]);
        if(button.hasClass('save-perm')) {
            button.on('click', function() {
                var row = this.parentNode.parentNode,
                    parent = row.parentNode,
                    tid = $('input[name="tid"]', row).val(),
                    data =  (tid == 'x' ? '' : 'tid='+tid+'&')+
                        'perm='+$('input[name="perm[]"]', row).val()+
                        '&pdesc='+$('input[name="pdesc[]"]', row).val();

                $.ajax({
                    url		: baseUrl+'docs/insert/permission/'+rid,
                    type	: 'post',
                    dataType: 'json',
                    data	: data,
                    success	: function(data) {
                        if(data.status == false) {
                            alert(data.message);
                            return;
                        }

                        $(row).remove();
                        $(parent).append(data.permission);
                    }
                });
            });
        }
        else if(button.hasClass('cancel-perm')) {
            button.on('click', function() {
                $(this.parentNode.parentNode).remove();
            });
        }
    }
}

function bindClickAction() {
    if(jQuery.editable) {
        $('body').on('click', 'img.details-img', function() {
            toggleCommandDetails(this.parentNode.parentNode);
        });

        $('body').on('dblclick', '.editable, .editarea, .editselect, .editautocomplete', function() {
            if(isEditing) {
                return false;
            }
        });
        makeEditable();

        $('body').on('click', '.add-permission', function() {
            // Only one perm can be added at a time
            var parent = this.parentNode,
                id = $(this).attr('id').split('-');
            if($('input', $(parent).siblings('table')[0]).length && id[1] != 'x') {
                return;
            }
            var row = addNewPermission($(parent).siblings('table'), id[1]);
            var buttons = row.find('.button');
            bindPermissionFormClicks(buttons);
            buttons.button();

        });

        $('body').on('click', '.delete-item', function() {
            var id = $(this).attr('id').split('-'),
                confirmMsg = 'Are you sure you want to delete this ',
                row = this.parentNode.parentNode;

            switch(id[0]) {
                case 'cmd':
                    confirmMsg += 'command\n- all associated permissions will be removed?';
                    break;
                case 'perm':
                    confirmMsg += 'permission?';
                    break;
                case 'release':
                    confirmMsg += 'Release\n- all associated triggers and permissions will be removed?';
                    break;
                default:
                    return;
            }

            confirmMsg += '\nThis action cannot be undone.';
            if(confirm(confirmMsg)) {
                $.ajax({
                    url		: baseUrl+'docs/delete/'+id[0]+'/'+rid+'/'+id[1],
                    type	: 'get',
                    dataType: 'json',
                    success	: function(data) {
                        if(data.status == false) {
                            alert(data.message);
                            return;
                        }

                        if(id[0] == 'cmd') {
                            commandsTable.fnClose(row);
                            commandsTable.fnDeleteRow(row);
                        }
                        else if(id[0] == 'release') {
                            window.location.href = baseUrl;
                        }
                        else {
                            $(row).remove();
                        }
                    }
                });
            }
        });
   }
    else {
        $('body').on('click', '#commands > tbody > tr > td', function() {
            toggleCommandDetails(this.parentNode);
        });
    }
}

$(document).ready(function() {
	$('.button').button();
	rid = $('#rid').attr('value');
	baseUrl = $('#base-url').val();

	commandsTable = $('#commands').dataTable({
		bAutoWidth		: false,
		bFilter			: true,
		bJQueryUI		: true,
		bLengthChange	: false,
		bPaginate		: false,
		bSort			: true,
		aaSorting		: [ [2,'asc'], [3,'asc'] ],
		iDisplayLength	: 20,
		sDom			: 'r<"toolbar ui-widget-header"f>ti',
        bProcessing     : true,
        sAjaxSource     : baseUrl+'docs/fetch/commands/'+rid,
        fnInitComplete  : function() {
            makeEditable('#'+this.attr('id'));
        },
		aoColumns		: [
		   { 'bVisible' : false },
		   { 'sWidth'   : '5%',  'bSortable' : false },
		   { 'sWidth'   : '10%', 'bSortable' : true  },
		   { 'sWidth'   : '15%', 'bSortable' : true  },
		   { 'sWidth'   : '15%', 'bSortable' : true  },
		   { 'sWidth'   : '15%', 'bSortable' : true  },
		   { 'sWidth'   : '25%', 'bSortable' : false }
		],
		fnRowCallback	: function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
			$('td:eq(0)', nRow).addClass('center');
			$('td:eq(1)', nRow).attr('id', 'cmd-'+aData[0]+'-cat').addClass('editautocomplete');
			$('td:eq(2)', nRow).attr('id', 'cmd-'+aData[0]+'-trigger').addClass('editable');
			$('td:eq(3)', nRow).attr('id', 'cmd-'+aData[0]+'-alias').addClass('editable');
			$('td:eq(4)', nRow).attr('id', 'cmd-'+aData[0]+'-desc').addClass('editable');
			$('td:eq(5)', nRow).attr('id', 'cmd-'+aData[0]+'-syntax').addClass('editarea');

			return nRow;
		}
	});

	permissionsTable = $('#permissions').dataTable({
		bAutoWidth		: false,
		bFilter			: true,
		bJQueryUI		: true,
		bLengthChange	: false,
		bPaginate		: false,
		bSort			: true,
		aaSorting		: [ [2,'asc'], [3,'asc'], [4,'asc'] ],
		iDisplayLength	: 20,
		sDom			: 'r<"toolbar ui-widget-header"f>ti',
        bProcessing     : true,
        sAjaxSource     : baseUrl+'docs/fetch/permissions/'+rid,
		aoColumns		: [
		   { 'bVisible' : false },
		   { 'bVisible' : false },
		   { 'sWidth'   : '10%', 'bSortable' : true  },
		   { 'sWidth'   : '15%', 'bSortable' : true  },
		   { 'sWidth'   : '25%', 'bSortable' : true  },
		   { 'sWidth'   : '50%', 'bSortable' : true  }
		]
	});

	$('#releases').appendTo('.dataTables_wrapper .toolbar');
    bindReleaseSelector();

	$('#add-command').click(function() {
		$('#new-command-form').dialog('open');
	});

    $('#clone-release').click(function() {
        $('#new-release-form').dialog('open');
    });

	$('#new-command-form #cat').autocomplete({
		source		: function(request, response) {
			$.ajax({
				url		: baseUrl+'docs/fetch/category/' + request.term,
				type	: 'get',
				dataType: 'json',
				success	: function(data) {
					response(data);
				}
			})
		},
		minLength	: 2
	});

	$('#new-command-form img.delete-perm').on('click', function() {
		$(this.parentNode.parentNode).remove();
	});

	$('#new-command-form').dialog({
		autoOpen	: false,
		height		: 'auto',
		width		: 915,
		model		: true,
		buttons		: {
			'Add Command'	: function() {
				$('#new-command-form input, #new-command-form textarea').removeClass('ui-state-error');
				var bValid = true,
					msgDom = $('#validation-msg');

				bValid = bValid && checkIsSet($('#cat'), 'Category', msgDom);
				bValid = bValid && checkIsSet($('#trigger'), 'Trigger', msgDom);
				bValid = bValid && checkIsSet($('#desc'), 'Description', msgDom);
				bValid = bValid && checkIsSet($('#syntax'), 'Syntax', msgDom);

				if(bValid) {
					var data = '';
					$('#new-command-form input, #new-command-form textarea').each(function(index, element) {
						data += (data.length ? '&' : '') + $(element).attr('name') + '=' + $(element).val();
					});
					$.ajax({
						url		: baseUrl+'docs/insert/command/'+rid,
						type	: 'post',
						dataType: 'json',
						data	: data,
						success	: function(data) {
							if(data.status == false) {
								alert(data.message);
								return false;
							}

							commandsTable.fnAddData(data.command);
							$('#new-command-form').dialog('close');
						}
					});
				}
			},
			'Cancel'		: function() {
				$(this).dialog('close');
			}
		},
		open		: function() {
			$('#validation-msg').empty();
			$('#new-command-form input, #new-command-form textarea').val('').removeClass('ui-state-error');
			$('#new-command-form table.command-permissions tbody').empty();
			addNewPermission($('#new-command-form table.command-permissions'), 'x');
			$('#new-command-form input#cat').focus();
		}
	});

    $('#new-release-form').dialog({
        autoOpen	: false,
        height		: 'auto',
        width		: 450,
        model		: true,
        buttons		: {
            'Clone'	: function() {
                $('#new-release-form input, #new-release-form select').removeClass('ui-state-error');
                var bValid = true,
                    msgDom = $('#release-validation-msg');

                bValid = bValid && checkIsSet($('#name'), 'Release', msgDom);
                bValid = bValid && checkIsSet($('#source_release'), 'Source Release', msgDom);

                if(bValid) {
                    var data = '';
                    $('#new-release-form input, #new-release-form select, #new-release-form textarea').each(function(index, element) {
                        data += (data.length ? '&' : '') + $(element).attr('name') + '=' + $(element).val();
                        $(element).attr('disabled', 'disabled');
                    });

                    $.ajax({
                        url		: baseUrl+'docs/insert/release/',
                        type	: 'post',
                        dataType: 'json',
                        data	: data,
                        success	: function(data) {
                            $('#new-release-form input, #new-release-form select').removeAttr('disabled');
                            if(data.status == false) {
                                alert(data.message);
                                return false;
                            }
                            window.location.href = baseUrl+'docs/commands/'+data.rid;
                        }
                    });
                }
            },
            'Cancel'		: function() {
                $(this).dialog('close');
            }
        },
        open		: function() {
            $('#release-validation-msg').empty();
            $('#new-release-form input, #new-release-form select').val('').removeClass('ui-state-error');
            $('#new-release-form input#release').focus();
        }
    });

    bindClickAction();
});
