<?php $student=$student??[];$old=$old??[];$val=function($k)use($student,$old){return e($old[$k]??$student[$k]??'');};?>
<div class="row g-4">
<div class="col-md-6"><label class="form-label">Full Name *</label><input class="form-control" name="name" value="<?=$val('name')?>" required></div>
<div class="col-md-6"><label class="form-label">Email *</label><input class="form-control" type="email" name="email" value="<?=$val('email')?>" required></div>
<div class="col-md-6"><label class="form-label">Phone *</label><input class="form-control phone-input" name="phone" maxlength="10" value="<?=$val('phone')?>" required></div>
<div class="col-md-6"><label class="form-label">CGPA *</label><input class="form-control" type="number" min="0" max="10" step="0.01" name="cgpa" value="<?=$val('cgpa')?>" required></div>
<div class="col-md-6"><label class="form-label">Branch *</label><select class="form-select" name="branch" required><option value="">Select branch</option><?php foreach(branches() as $x):?><option value="<?=e($x)?>" <?=($old['branch']??$student['branch']??'')===$x?'selected':''?>><?=e($x)?></option><?php endforeach;?></select></div>
<div class="col-md-6"><label class="form-label">Course *</label><select class="form-select" name="course" required><option value="">Select course</option><?php foreach(courses() as $x):?><option value="<?=e($x)?>" <?=($old['course']??$student['course']??'')===$x?'selected':''?>><?=e($x)?></option><?php endforeach;?></select></div>
<div class="col-md-6"><label class="form-label">College *</label><input class="form-control" name="college" value="<?=$val('college')?>" required></div>
<div class="col-md-6"><label class="form-label">Status *</label><select class="form-select" name="status" required><?php foreach(statuses() as $x):?><option value="<?=e($x)?>" <?=($old['status']??$student['status']??'Active')===$x?'selected':''?>><?=e($x)?></option><?php endforeach;?></select></div>
<div class="col-12"><label class="form-label">Address *</label><textarea class="form-control" rows="4" name="address" required><?=$val('address')?></textarea></div>
<div class="col-12"><label class="form-label">Profile Photo</label><input class="form-control photo-input" type="file" name="photo" accept="image/jpeg,image/png,image/webp"><small class="form-text">Optional. JPG, PNG or WebP, maximum 2 MB.</small><?php if(!empty($student['photo'])):?><div class="current-photo mt-3"><img src="uploads/<?=e($student['photo'])?>"><span>Current photo</span></div><?php endif;?></div>
</div>
