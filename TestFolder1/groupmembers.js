/**
 * @author Next Sphere Technologies
 * Group Members and Manage members view
 * 
 */

var GroupMemberHeader = function(){
	var accessToken = $("#accessToken_meta").val();
	var langId = $("#langId_meta").val();
	return{
		settings:{
			
		},
		groupMemberNamesJson:[],
		defaults:{
			ele:"#GroupSummaryContainer",
			groupInfo:'',
			isFromManage:false,
			levelName:'Group Members'
		},
		init:function(options){
			 this.settings = $.extend(this.defaults,options);
             var element = this.settings.ele;
             this.staticUI(element);
             
             
		},
		staticUI:function(element){
			var template =  '';
			template+= HTML.groupMembersHeader();
			var data={
				isFromManage:GroupMemberHeader.settings.isFromManage,
				levelName:GroupMemberHeader.settings.levelName
			};
			if(GroupMemberHeader.settings.groupInfo.groupChoice == "67"){
				data.isControlledGroup = true;
			}
      	   var html = Mustache.to_html(template,data);
      	   if(GroupMemberHeader.settings.isFromManage){
      		   
      		 $(element).html('<div class="height-47 groups-dropdown" id="groupMemberHeaderContainerDiv"></div>')
       	     $("#groupMemberHeaderContainerDiv").html(html); 
      	   }else{
      		 $(element).html(html);
      	   }
      	  GroupMemberHeader.bindEvents();
		},
		getMemberNamesSuccessCallBack:function(data){
			GroupMemberHeader.groupMemberNamesJson=[];
			if(data.groupMemberNames != undefined && data.groupMemberNames.length == undefined){
				data.groupMemberNames = [data.groupMemberNames];
			}
			for(var i=0;i<data.groupMemberNames.length;i++){
				GroupMemberHeader.groupMemberNamesJson.push({label:data.groupMemberNames[i],value:data.groupMemberNames[i]});
			}
			
			$("#group-member-name-search-box").autocomplete({
	       		  source: GroupMemberHeader.groupMemberNamesJson,
	       		  minLength: 1,
	       		  select: function( event, ui ) {
	       			var membername = ui.item.value;
					/*if(membername != ''){*/
						var options = {
								ele:"#mainContentContainer",
								pageNo:1,
								pageSize:28,
								membername:membername,
								groupUniqueIdentifier:GroupMemberHeader.settings.groupInfo.uniqueIdentifier
						};
						GroupMembers.init(options);
					/*}else{
						alert('please enter member name');
					}*/
	       		  }
	       		  
	       	  });
		},
		bindEvents:function(){
			$("[id^=connection-group-]").off("click").bind("click",function(e){
				var level = $(this).attr('level');
				var levelName = $(this).attr('levelName');
				$("#group-members-subtitle").html(levelName);
				var options = {
						ele:"#mainContentContainer",
						level:level,
						pageNo:1,
						pageSize:28,
						groupPermissions:GroupMemberHeader.settings.groupPermissions,
						groupUniqueIdentifier:GroupMemberHeader.settings.groupInfo.uniqueIdentifier
				};
				GroupMembers.init(options);
			});
			$("[id^=manage-group-members-]").off("click").bind("click",function(e){
				var level = $(this).attr('level');
				var levelName = $(this).attr('levelName');
				$("#group-members-subtitle").html(levelName);
				var options = {
						ele:"#mainContentContainer",
						level:level,
						pageNo:1,
						pageSize:28,
						groupPermissions:GroupMemberHeader.settings.groupPermissions,
						groupUniqueIdentifier:GroupMemberHeader.settings.groupInfo.uniqueIdentifier,
				};
				GroupMembers.init(options);
			});
			$("#group-members-search-icon").off("click").bind("click",function(e){
				$("#group-member-name-search-box").val('');
				$("#group-members-search-icon i").toggleClass("selected-sm");
				$("#group-member-name-search-box").toggleClass('hide');
				var groupUniqueIdentifierVal = GroupMemberHeader.settings.groupInfo.uniqueIdentifier;
				if(groupUniqueIdentifierVal == undefined){
					groupUniqueIdentifierVal = GroupMemberHeader.settings.uniqueIdentifier;
				}
				//TODO::need to make service call to bring the member names
				var groupMebersRequest={
						groupUniqueIdentifier:groupUniqueIdentifierVal,
						pageCriteria:{
							pageCriteriaModel : {
								pageSize : 28,
								pageNo : 1,
								isAll : true
						    }
						}
				};
				//groupMebersRequest = JSON.stringify(groupMebersRequest);
				var headers={
						accessToken:accessToken,
						langId:langId
				};
				//headers = JSON.stringify(headers);
				var options = {
					url:getModelObject('serviceUrl')+'/group/1.0/getGroupMemberNames',
					data:groupMebersRequest,
					headers:headers,
					successCallBack:GroupMemberHeader.getMemberNamesSuccessCallBack,
					async:true
				};
				doAjax.GetServiceInvocation(options);
			}); 
			
			
			$("#group-member-name-search-box").keypress(function(e){
				if(e.which == 13){
					membername = $(this).val();
						var options = {
								ele:"#mainContentContainer",
								pageNo:1,
								pageSize:28,
								membername:membername,
								groupUniqueIdentifier:GroupMemberHeader.settings.groupInfo.uniqueIdentifier
						};
						GroupMembers.init(options);
				}
				
			});
			
			$("#group-member-name-search-box").keyup(function(e){
				    if($(this).val() == ''){
				    	membername = '';
						var options = {
								ele:"#mainContentContainer",
								pageNo:1,
								pageSize:28,
								membername:membername,
								groupUniqueIdentifier:GroupMemberHeader.settings.groupInfo.uniqueIdentifier
						};
						GroupMembers.init(options);
				    }
					
				
			});
		}
		
	};
	
}.call(this);

var GroupMembers = function(){
	var isMore = false;
	var groupUniqueIdentifier;
	return{
		settings:{
			
		},
		defaults:{
			pageNo:1,
			pageSize:28,
			pageCount:1
		},
		groupMembersArray:[],
		destory:function(){
			GroupMembers.settings ={};
		},
		init:function(options){
			this.destory();
			this.settings = $.extend(this.defaults,options);
            var element = this.settings.ele;
            this.staticUI(element);
            var serviceRequestOptions = this.prepareServiceRequest(this.settings.pageNo);
            this.serviceInvocation(serviceRequestOptions);
		},
		prepareServiceRequest:function(pageNo){
       	  
       	var getAllMembersURI = $("#getAllGroupMembersURI").val();
  		
  		var getMembers = getModelObject('serviceUrl')+getAllMembersURI;
  		var accessToken = $("#accessToken_meta").val();
		var langId = $("#langId_meta").val();
		if($("#groupUniqueIdentifier").val()){
			groupUniqueIdentifier =$("#groupUniqueIdentifier").val();
		}else{
			groupUniqueIdentifier =GroupMembers.settings.groupUniqueIdentifier;	
		}
  		
  		var getGroupMembersRequest = {
  			accessToken : accessToken,
  			langId : langId,
  			groupUniqueIdentifier : groupUniqueIdentifier,
  			pageCriteriaModel : {
					pageSize : GroupMembers.settings.pageSize,
					pageNo : GroupMembers.settings.pageNo,
					isAll : false
			}
  		};
  		var searchCriteria = [];
  		var mode='default';
  		if(GroupMembers.settings.level == 'all'){
  			if(GroupMembers.settings.mode){
  				mode=GroupMembers.settings.mode;
  			}else{
  				mode='default';
  			}
  			//nothing criteria
  		}else if(GroupMembers.settings.level == 'myconnections'){
  			  mode='default';
  			  searchCriteria.push({
  					groupMemberSearchAttributeEnum:'ASSOCIATION_LEVEL',
  	  				searchValue:'FIRST_LEVEL'	
  			});
  		}else if(GroupMembers.settings.level == 'others'){
  			mode='default';
  			searchCriteria.push({
  					groupMemberSearchAttributeEnum:'ASSOCIATION_LEVEL',
  	  				searchValue:'OTHERS'
  			});
  		}else if(GroupMembers.settings.level == 'pending'){
  			mode='pendingMember';
  			searchCriteria.push({
					groupMemberSearchAttributeEnum:'MEMBER_STATUS',
	  				searchValue:'Pending for Approval'
			});
  		}else if(GroupMembers.settings.level == 'preapproved'){
  			mode='default';
  			searchCriteria.push({
					groupMemberSearchAttributeEnum:'PREAPPROVAL',
	  				searchValue:'PREAPPROVAL'
			});
  		}
  		if(GroupMembers.settings.membername){
  			searchCriteria.push({
					groupMemberSearchAttributeEnum:'MEMBER_NAME',
	  				searchValue:GroupMembers.settings.membername
			});
  		}
  		getGroupMembersRequest.groupmemberSearchModelList = searchCriteria;
  		getGroupMembersRequest = JSON.stringify(getGroupMembersRequest);
  		var getAllGroupMembersURI = $("#getAllGroupMembersURI").val();
  		
  		var getMembers = getModelObject('serviceUrl')+getAllGroupMembersURI;
       	   var options={
       		    url:getMembers,
       		    data:getGroupMembersRequest,
       		    requestInfo:{mode:mode},
       		    parentId:GroupMembers.settings.ele,
       		    successCallBack:GroupMembers.successCallBack,
       		    async:true
       	   };
       	   
       	   return options;
        },
        serviceInvocation:function(options){
        	doAjax.PostServiceInvocation(options);
        },
        successCallBack:function(requestInfo,data){
        	var template='{{#members}}'
        		        +'<div>'
        		        +'<div class="position-relative height-100-percent">'
        		        +'</div>'
		        		+'	<li class="{{evenOrOddClass}} position-relative">'
		        		+'  <div class="pad-12 wh-430 position-absolute darkborder members-fullview fullview-md-size whitebg  {{fourthElementClass}} {{bottomElementClass}} hide" id="group-member-shortprofile-{{count}}"> hello..</div>'
		        		+'  <div class="pad-12 wh-430 position-absolute darkborder members-fullview fullview-md-size whitebg {{fourthElementClass}} {{bottomElementClass}} hide" id="group-member-changerole-{{count}}"> hello..</div>'
		        		+'		{{#photoId}}<img id="groupMemberImage-{{count}}" userId="{{userId}}" mode="{{mode}}" memberId="{{memberId}}" uniqueIdentifier="{{profileUniqueIdentifier}}" count="{{count}}" src="/contextPath/User/{{photoId}}/profile.jpg" class="img-sm-circle "/>{{/photoId}}'
		        		+'		{{^photoId}}<img id="groupMemberImage-{{count}}" userId="{{userId}}" mode="{{mode}}" memberId="{{memberId}}" uniqueIdentifier="{{profileUniqueIdentifier}}" count="{{count}}" src="'+contextPath+'/static/pictures/profiles/no-profile-pic.jpg" class="img-sm-circle "/>{{/photoId}}'
		        		+'		<div class="align-center pad-top-5 font-10px helvetica-neue-roman" id="groupMember-{{count}}" userId="{{userId}}" memberId="{{memberId}}" mode="{{mode}}" uniqueIdentifier="{{profileUniqueIdentifier}}" count="{{count}}">{{memberName_modified}}</div>'
		        		+'	</li>'
		        		+'</div>'
		        		+'{{/members}}';
		        		
  var paginationTemplate='{{#isPaginationRequired}}'
	  					+'<span class="pull-left"><a href="javascript:void(0);" level="{{level}}" mode="{{mode}}" pageCount="1" pageNo="1" id="group-members-first-button"><i class="glyphicon glyphicon-step-backward"></i></a>&nbsp;<a href="javascript:void(0);" class="{{#hasPrev}}{{/hasPrev}}{{^hasPrev}}ancher_lock{{/hasPrev}}" level="{{level}}" mode="{{mode}}" pageCount="{{pageCount}}" pageNo="{{pageNo}}" id="group-members-prev-button"><i class="glyphicon glyphicon-backward"></i></a></span>'
	  					+'<span class="pull-right"><a href="javascript:void(0);" class="{{#hasNext}}{{/hasNext}}{{^hasNext}}ancher_lock{{/hasNext}}" level="{{level}}" mode="{{mode}}" pageCount="{{pageCount}}" pageNo="{{pageNo}}" id="group-members-next-button"><i class="glyphicon glyphicon-forward"></i></a>&nbsp;<a href="javascript:void(0);" level="{{level}}" mode="{{mode}}" pageCount="{{lastPageCount}}" pageNo="{{lastPageNo}}" id="group-members-last-button"><i class="glyphicon glyphicon-step-forward"></i></a></span>'
	  					+'{{/isPaginationRequired}}';
  
        	var members = data.manageGroupMemberModelList;
        	if(members){
        		if(members != undefined && members.length == undefined){
            		members = [members];
            	}
            	/* pagination code starts here*/
            	var hasNext = false;
            	var hasPrev = false;
            	var hasFirst = true;
            	var hasLast = true;
            	var currentPageNo = GroupMembers.settings.pageNo;
            	currentPageNo = parseInt(currentPageNo);
            	var currentPageSize = GroupMembers.settings.pageSize;
            	currentPageSize = parseInt(currentPageSize);
            	var totalCount = parseInt(members[0].memberCount);
            	var lastPageCount=1;
            	var lastPageNo = 1;
            	var isPaginationRequired = false;
            	if(totalCount > currentPageSize){
            		isPaginationRequired = true;
            		if((totalCount > currentPageSize) && ((totalCount%currentPageSize) == 0)){
                		lastPageCount = Math.floor(totalCount/currentPageSize);
                	    lastPageNo = ((lastPageCount*currentPageSize) - currentPageSize)+1;
                	}else{
                		lastPageCount = Math.floor(totalCount/currentPageSize)+1;
                		if(totalCount > currentPageSize){
                			lastPageNo = ((lastPageCount*currentPageSize) - totalCount)+(totalCount%currentPageSize)+1;
                		}else{
                			lastPageNo = Math.floor(totalCount/currentPageSize)+1;
                		}
                		
                	}
                	if(GroupMembers.settings.pageNo == 1){
                		hasFirst =true;
                	}
                	if(members[0].memberCount > (currentPageNo+currentPageSize) ){
                		hasNext = true;
                	}
                	if(GroupMembers.settings.pageNo > 1){
                		hasPrev = true;
                	}
                	
                	if(GroupMembers.settings.pageCount == lastPageCount){
                		hasNext = false;
                		hasPrev = false;
                	}	
            	}else{
            		isPaginationRequired = false;
            	}
            	
            	/* pagination code ends here*/
            	var row = 1;
            	var column = 0;
            	
            	for(var i=0;i<members.length;i++){
            		members[i].count = i;
            		var j = parseInt(i)+1;
            		j = parseInt(j);
            		if(parseInt(j)%2 == 0){
            			members[i].evenOrOddClass='evenElementClass';
            		}else{
            			members[i].evenOrOddClass='oddElementClass';
            		}
            		
            		//Need to modify the member name for alignment purpose
            		if(members[i].memberName.length  > 11){
            			members[i].memberName_modified = members[i].memberName.substring(0,10)+'...';
            		}else{
            			members[i].memberName_modified = members[i].memberName;
            		}
            		
            		column = column+1;
            		
            		members[i].row = row;
            		members[i].column = column;
            		if(j%7 == 0){
            			row = row+1;
            			column = 0;
            		}
            		
            	}
            	for(var i=0;i<members.length;i++){
            	    if(members[i].column == 6 || members[i].column == 7){
            	    	//need to place the class here.
            	    	members[i].fourthElementClass='right0';
            	    }
            	    var lastElementCoutThresold = parseInt(currentPageSize)-14;
            		if(parseInt(lastElementCoutThresold) > 0 && members[i].row > 2){
            			members[i].bottomElementClass='bottom0';
            		}
            	}
            	
            	var membersJson ={
            			members:members,
            			hasNext:hasNext,
            			hasPrev:hasPrev,
            			level:GroupMembers.settings.level,
            			pageNo:GroupMembers.settings.pageNo,
            			lastPageCount:lastPageCount,
            			pageCount:GroupMembers.settings.pageCount,
            			lastPageNo:lastPageNo,
            			mode:requestInfo.mode,
            			isPaginationRequired:isPaginationRequired
            	};
            	
            	if(!requestInfo.mode){
            		membersJson.mode = GroupMembers.settings.mode;
            	}
            	
            	GroupMembers.groupMembersArray = members;
            	var html = Mustache.to_html(template,membersJson);
            	$("#groupMembers-div").html(html);
            	var paginationhtml = Mustache.to_html(paginationTemplate,membersJson);
            	$("#group-members-pagination-div").html(paginationhtml);
        	}else{
        		$("#groupMembers-div").html('<div class="default-message-style">No members are available</div>');
        	}
        	
        	GroupMembers.bindEvents();
        },
		staticUI:function(element){
			 var html='';
			     html+='<ul class="group-members-blocks" id="groupMembers-div"></ul><div  id="group-members-pagination-div" class="clear-float width-200 font-24 margin-center"><div>';
			     $(element).append('<div class="members-profilepic min-height-620 mar-trbl-25" id="groupMembersContainerDiv"></div>');
			     $("#groupMembersContainerDiv").html(html);
		},
		buildUserShortProfile:function(count,userId,profileUniqueIdentifier,memberId,mode){
			var memberProfiles = [];
			var memberObject;
			for(var i=0;i<GroupMembers.groupMembersArray.length;i++){
				memberProfiles.push(GroupMembers.groupMembersArray[i]);
				if(memberId == GroupMembers.groupMembersArray[i].memberId ){
					memberObject = GroupMembers.groupMembersArray[i];
					memberObject.groupUniqueIdentifier = groupUniqueIdentifier;
				}
			}
			var options = {
					ele:"#group-member-shortprofile-"+count,
					count:count,
					userId:userId,
					profileUniqueIdentifier:profileUniqueIdentifier,
					members:memberProfiles,
					member:memberObject,
					mode:mode,
					groupData:GroupMembers.settings.groupData,
					groupPermissions:GroupMembers.settings.groupPermissions
			};
			UserShortProfile.init(options);
			//$("#group-member-shortprofile-"+count).removeClass('hide');
		},
		removeUserShortProfile:function(){
			$("[id^=group-member-shortprofile-]").html('');
			$("[id^=group-member-shortprofile-]").addClass('hide');
		},
		bindEvents:function(){
			$("[id^=groupMember-]").click(function(e){
				var count = $(this).attr('count');
				var userId = $(this).attr('userId');
				var memberId = $(this).attr('memberId');
				var mode = $(this).attr('mode');
				var profileUniqueIdentifier = $(this).attr('uniqueIdentifier');
				GroupMembers.removeUserShortProfile();
				GroupMembers.buildUserShortProfile(count, userId, profileUniqueIdentifier,memberId,mode);
			});
			
			$("[id^=groupMemberImage-]").click(function(e){
				var count = $(this).attr('count');
				var userId = $(this).attr('userId');
				var profileUniqueIdentifier = $(this).attr('uniqueIdentifier');
				var memberId = $(this).attr('memberId');
				var mode = $(this).attr('mode');
				GroupMembers.removeUserShortProfile();
				GroupMembers.buildUserShortProfile(count, userId, profileUniqueIdentifier,memberId,mode);
			});
			
			$("#group-members-first-button").click(function(e){
				var currentPageNo = $(this).attr("pageNo");
				var level = $(this).attr('level');
				currentPageNo = parseInt(currentPageNo);
				var currentPageSize = parseInt(GroupMembers.settings.pageSize);
				//var nextPageNo = (currentPageNo+currentPageSize);
				var mode = $(this).attr('mode');
				var options = {
						ele:"#mainContentContainer",
						level:level,
						pageNo:currentPageNo,
						mode:mode,
						groupPermissions:GroupMembers.settings.groupPermissions
				};
				GroupMembers.init(options);
			});
			
			$("#group-members-last-button").click(function(e){
				var currentPageNo = $(this).attr("pageNo");
				var level = $(this).attr('level');
				currentPageNo = parseInt(currentPageNo);
				var currentPageSize = parseInt(GroupMembers.settings.pageSize);
				//var nextPageNo = (currentPageNo+currentPageSize);
				var mode = $(this).attr('mode');
				var options = {
						ele:"#mainContentContainer",
						level:level,
						pageNo:currentPageNo,
						mode:mode,
						groupPermissions:GroupMembers.settings.groupPermissions
				};
				GroupMembers.init(options);
			});
			
			$("#group-members-next-button").click(function(e){
				GroupMembers.settings.pageCount = parseInt(GroupMembers.settings.pageCount)+1;
				var currentPageNo = $(this).attr("pageNo");
				var level = $(this).attr('level');
				currentPageNo = parseInt(currentPageNo);
				var currentPageSize = parseInt(GroupMembers.settings.pageSize);
				var nextPageNo = (currentPageNo+currentPageSize);
				var mode = $(this).attr('mode');
				var options = {
						ele:"#mainContentContainer",
						level:level,
						pageNo:nextPageNo,
						pageCount:GroupMembers.settings.pageCount,
						mode:mode,
						groupPermissions:GroupMembers.settings.groupPermissions
				};
				GroupMembers.init(options);
			});
			$("#group-members-prev-button").click(function(e){
				var currentPageNo = $(this).attr("pageNo");
				var level = $(this).attr('level');
				currentPageNo = parseInt(currentPageNo);
				var currentPageSize = parseInt(GroupMembers.settings.pageSize);
				var nextPageNo = currentPageNo-currentPageSize;
				var mode = $(this).attr('mode');
				var options = {
						ele:"#mainContentContainer",
						level:level,
						pageNo:nextPageNo,
						pageCount:GroupMembers.settings.pageCount,
						mode:mode,
						groupPermissions:GroupMembers.settings.groupPermissions
				};
				GroupMembers.init(options);
			});
		}
	};
}.call(this);











