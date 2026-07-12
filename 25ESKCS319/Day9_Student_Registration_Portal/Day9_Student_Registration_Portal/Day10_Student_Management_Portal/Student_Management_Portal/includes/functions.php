<?php
function e(?string $v):string{return htmlspecialchars($v??'',ENT_QUOTES,'UTF-8');}
function clean(string $v):string{return trim($v);} function redirect(string $u):never{header("Location: $u");exit;}
function branches():array{return ['Computer Science','Information Technology','Electronics','Mechanical Engineering','Civil Engineering','Business Administration'];}
function courses():array{return ['B.Tech','BCA','BBA','B.Sc','MCA','MBA'];}
function statuses():array{return ['Active','Inactive'];}
function initials(string $name):string{$r='';foreach(preg_split('/\s+/',trim($name)) as $p){if($p!=='')$r.=mb_strtoupper(mb_substr($p,0,1));}return mb_substr($r,0,2);}
function deletePhoto(?string $f):void{if(!$f)return;$p=__DIR__.'/../uploads/'.basename($f);if(is_file($p))@unlink($p);}
function uploadPhoto(array $f):array{
 if(($f['error']??UPLOAD_ERR_NO_FILE)===UPLOAD_ERR_NO_FILE)return ['ok'=>true,'filename'=>null,'error'=>null];
 if(($f['error']??UPLOAD_ERR_OK)!==UPLOAD_ERR_OK)return ['ok'=>false,'filename'=>null,'error'=>'Photo upload failed.'];
 if(($f['size']??0)>2*1024*1024)return ['ok'=>false,'filename'=>null,'error'=>'Photo must not exceed 2 MB.'];
 $allowed=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'];$mime=(new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
 if(!isset($allowed[$mime]))return ['ok'=>false,'filename'=>null,'error'=>'Photo must be JPG, PNG or WebP.'];
 $name=bin2hex(random_bytes(12)).'.'.$allowed[$mime];$dest=__DIR__.'/../uploads/'.$name;
 if(!move_uploaded_file($f['tmp_name'],$dest))return ['ok'=>false,'filename'=>null,'error'=>'Could not save photo.'];
 return ['ok'=>true,'filename'=>$name,'error'=>null];
}
function validateStudent(array $in,PDO $pdo,?int $ignore=null):array{
 $er=[];$name=clean($in['name']??'');$email=clean($in['email']??'');$phone=preg_replace('/\D+/','',$in['phone']??'');$cg=$in['cgpa']??'';$branch=clean($in['branch']??'');$course=clean($in['course']??'');$college=clean($in['college']??'');$address=clean($in['address']??'');$status=clean($in['status']??'');
 if($name===''||mb_strlen($name)<2||!preg_match("/^[\p{L}\s.'-]+$/u",$name))$er[]='Enter a valid name without numbers.';
 if(!filter_var($email,FILTER_VALIDATE_EMAIL))$er[]='Enter a valid email.';
 if(!preg_match('/^[0-9]{10}$/',$phone))$er[]='Phone must contain exactly 10 digits.';
 if($cg===''||!is_numeric($cg)||(float)$cg<0||(float)$cg>10)$er[]='CGPA must be between 0 and 10.';
 if(!in_array($branch,branches(),true))$er[]='Select a valid branch.';
 if(!in_array($course,courses(),true))$er[]='Select a valid course.';
 if(mb_strlen($college)<3)$er[]='Enter a valid college name.';
 if(mb_strlen($address)<10)$er[]='Address must contain at least 10 characters.';
 if(!in_array($status,statuses(),true))$er[]='Select a valid status.';
 if(filter_var($email,FILTER_VALIDATE_EMAIL)){$q=$ignore?$pdo->prepare('SELECT id FROM students WHERE email=? AND id!=?'):$pdo->prepare('SELECT id FROM students WHERE email=?');$q->execute($ignore?[$email,$ignore]:[$email]);if($q->fetch())$er[]='This email is already registered.';}
 return $er;
}
